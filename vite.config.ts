import react from '@vitejs/plugin-react'
import Vault from "node-vault";
import { type UserConfig, defineConfig, loadEnv } from "vite";

interface TokenRequest {
  token: string;
  endpoint: string;
  path: string;
}


/**
 * Fetch secrets from Hashicorp Vault
 *
 * @param param.token - Vault token
 * @param param.endpoint - Vault endpoint
 * @param param.path - Path to the secrets
 * @returns map of secrets
 */
const fetchSecrets = async ({ token, endpoint, path }: TokenRequest) => {
  const vault = Vault({
    apiVersion: "v1",
    endpoint: endpoint,
    token: token,
  });

  const { data } = await vault.read(path);
  return data.data;
};

/**
 * Returns define object for Vite
 *
 * @param userConfig user configuration
 * @returns define object
 */
const getDefine = async ({ mode }: UserConfig) => {
  if (!mode) {
    throw new Error("Mode is required. Please check your .env file.");
  }

  const env = loadEnv(mode, process.cwd(), "");
  const { VAULT_TOKEN, VAULT_ADDR, VAULT_PATH } = env;

  if (!VAULT_PATH) {
    throw new Error("VAULT_PATH is required. Please check your .env file.");
  }

  if (!VAULT_ADDR || !VAULT_TOKEN) {
    throw new Error(
      "You must be logged in to the HCV (use withhcv -command). See https://github.com/Metatavu/development-scripts/blob/master/hcv/withhcv.sh for more information.",
    );
  }

  const secrets = await fetchSecrets({
    token: VAULT_TOKEN,
    endpoint: VAULT_ADDR,
    path: VAULT_PATH,
  });

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  return Object.entries(secrets).reduce((acc: any, [key, value]) => {
    if (key.startsWith("VITE_")) {
      const envKey = `import.meta.env.${key}`;
      acc[envKey] = JSON.stringify(value);
    }
    
    return acc;
  }, {});
};

// https://vitejs.dev/config/
export default defineConfig(async (userConfig: UserConfig): Promise<UserConfig> => {
  return {
    define: await getDefine(userConfig),
    plugins: [react()],
  };
});
