import parse from "color-parse";
import moment from "moment";

namespace GenericUtils {
  /**
   * Get any enum keys
   *
   * @param enumObject enum object
   */
  export const enumKeys = <T extends {}>(enumObject: T) => {
    return Object.keys(enumObject);
  };

  /**
   * Get any enum values
   *
   * @param enumObject enum object
   */
  export const enumValues = <T extends {}>(enumObject: T) => {
    return Object.values(enumObject);
  };

  /**
   * Returns an array of distinct values
   *
   * @param array Array to get distinct values from
   * @returns Array of distinct values
   */
  export const distinctArray = <T,>(array: T[]) => [...new Set(array)];

  /**
   * Returns whether logged in user is a developer
   *
   * @param keycloak Keycloak instance
   * @returns Whether logged in user is a developer
   */
  export const isDeveloper = (keycloak: Keycloak.KeycloakInstance) =>
    keycloak.hasRealmRole("developer");

  /**
   * Formats date time string to a readable format
   *
   * @param dateTime date time
   * @param format format to use (default: DD.MM.yyyy HH:mm)
   * @returns formatted date time
   */
  export const formatDateTime = (
    dateTime: string | Date | number | undefined,
    format = "DD.MM.yyyy HH:mm"
  ) => {
    if (!dateTime) return "";
    return moment(dateTime).format(format);
  };

  /**
   * Formats date string to a readable format
   *
   * @param date date
   * @param format format to use (default: DD.MM.yyyy)
   * @returns formatted date
   */
  export const formatDate = (date: string | Date | number | undefined, format = "DD.MM.yyyy") => {
    if (!date) return "";
    return moment(date).format(format);
  };

  /**
   * Rounds given number to given precision
   *
   * @param number number to round
   * @param precision precision to round to (default: 2)
   * @returns rounded number
   */
  export const roundNumber = (number: number | string | undefined, precision = 2) => {
    if (typeof number === "number") {
      return number.toFixed(precision);
    }

    return parseFloat(number ?? "0.0").toFixed(precision);
  };

  /**
   * Converts CSS HEX color to CSS RGB function
   *
   * If the input is already in RGB format, it will be returned as is.
   * If the input is not a valid HEX, undefined will be returned.
   *
   * @param hexColor hex color string
   * @returns rgb color string
   */
  export const hexToRGB = (hexColor: string) => {
    if (hexColor.startsWith("@resources/")) return undefined;
    if (hexColor === "transparent") return undefined;
    const {
      values: [r, g, b],
      alpha = 0
    } = parse(hexColor);

    if (r === undefined || g === undefined || b === undefined) return undefined;

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };
}

export default GenericUtils;
