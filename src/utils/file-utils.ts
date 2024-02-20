import { Config } from "../constants/configuration";
import { StoredFile } from "../generated/client";

/**
 * Utility class for file operations
 */
namespace FileUtils {

  /**
   * Strips CSS url function from given url 
   * 
   * @param url URL without url function
   */
  export const stripUrlFunction = (url: string | undefined | null) => {
    if (!url) {
      return null;
    }

    return url.replace(/url\(['"]?([^'"]*)['"]?\)/i, '$1');
  }

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
  export const resolveFileUriPath = (uri: string | undefined | null) => {
    if (uri && uri.startsWith(Config.getConfig().cdnBasePath)) {
      return uri.split(Config.getConfig().cdnBasePath)[1];
    }

    return null;
  }

  /**
   * Resolves folder from given file uri
   * 
   * @param uri file uri
   * @returns folder of the file uri
   */
  export const resolveFilePathFolder = (uri: string | undefined | null) => {
    if (!uri) {
      return null;
    }

    if (uri.endsWith('/')) {
      return uri;
    }

    return uri.split('/').slice(0, -1).join('/');
  }

};
export default FileUtils;