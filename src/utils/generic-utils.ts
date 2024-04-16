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
    const isHex = /^#[0-9A-F]{6}$/i.test(hexColor);
    const isRgb = /rgba?\(\s*(\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*((1|0?\.\d+)))\s*\)/i.test(
      hexColor
    );

    if (!isHex && !isRgb) return undefined;
    if (isRgb) return hexColor;

    const hex = hexColor.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    return `rgb(${r}, ${g}, ${b})`;
  };
}

export default GenericUtils;
