import { Config } from "../constants/configuration";
import { StoredFile } from "../generated/client";

/**
 * Utility class for file operations
 */
namespace FileUtils {

  /**
   * Resolves path from given file
   * 
   * @param file file
   * @returns folder
   */
  export const resolveFilePath = (file: StoredFile) => {
    return resolveFileUriPath(file.uri);
  }

  /**
   * Resolves path from given file uri
   * 
   * @param uri file uri
   * @returns folder
   */
  export const resolveFileUriPath = (uri: string) => {
    return uri.split(Config.getConfig().cdnBasePath)[1];
  }

  /**
   * Resolves folder from given file uri
   * 
   * @param uri file uri
   * @returns folder of the file uri
   */
  export const resolveFilePathFolder = (uri: string) => {
    if (uri.endsWith('/')) {
      return uri;
    }

    return uri.split('/').slice(0, -1).join('/');
  }

};
export default FileUtils;