import {
  AvailableFonts,
  HtmlComponentType,
  HtmlTextComponentType,
  TextAlignment,
  TreeObject
} from "../types";
import { v4 as uuid } from "uuid";

namespace HtmlComponentsUtils {
  /**
   * Returns whether the selected component is inside video controls
   *
   * @param selectedComponent selected component
   * @returns whether the selected component is inside video controls
   */
  export const checkIfComponentIsInsideVideoControls = (selectedComponent?: TreeObject) => {
    if (!selectedComponent) return false;
    let isInsideVideoControls = false;
    let parentElement: HTMLElement | null = selectedComponent.element.parentElement;
    while (parentElement) {
      const parentElementType =
        parentElement.attributes.getNamedItem("data-component-type")?.nodeValue;
      if (parentElementType === HtmlComponentType.VIDEO_CONTROLS) {
        isInsideVideoControls = true;
        break;
      }
      parentElement = parentElement.parentElement;
    }
    return isInsideVideoControls;
  };
  /**
   * Returns serialized HTML element based on type
   *
   * @param type type
   * @param name name
   */
  export const getSerializedHtmlElement = (type: HtmlComponentType, name = "") => {
    switch (type) {
      case HtmlComponentType.BUTTON:
        return getHtmlButtonElement(name);
      case HtmlComponentType.LAYOUT:
        return getHtmlLayoutElement(name);
      case HtmlComponentType.TEXT:
        return getHtmlTextElement(name);
      case HtmlComponentType.IMAGE:
        return getHtmlImageElement(name);
      case HtmlComponentType.TABS:
        return getHtmlTabsElement(name);
      case HtmlComponentType.TAB:
        return getHtmlTabElement(name);
      case HtmlComponentType.VIDEO:
        return getHtmlVideoElement(name);
      case HtmlComponentType.IMAGE_BUTTON:
        return getHtmlImageButtonElement(name);
    }
  };

  const getHtmlLayoutElement = (name?: string) =>
    `<div id="${uuid()}" data-component-type="${
      HtmlComponentType.LAYOUT
    }" name="${name}" style="display: flex; flex-direction: row; width: 100%; height: 100%; background-repeat: no-repeat; background-position: center; background-image: @resources/${uuid()}; background-color: @resources/${uuid()};"></div>`;
  const getHtmlButtonElement = (name?: string) =>
    `<button id="${uuid()}" data-component-type="${
      HtmlComponentType.BUTTON
    }" name="${name}" style="background-color: @resources/${uuid()};">@resources/${uuid()}</button>`;
  const getHtmlTextElement = (name?: string) =>
    `<p id="${uuid()}" data-component-type="${
      HtmlComponentType.TEXT
    }" name="${name}" style="background-color: @resources/${uuid()};">@resources/${uuid()}</p>`;
  const getHtmlImageElement = (name?: string) =>
    `<img id="${uuid()}" data-component-type="${
      HtmlComponentType.IMAGE
    }" name="${name}" src="@resources/${uuid()}" style="background-color: @resources/${uuid()};"/>`;
  const getHtmlTabsElement = (name?: string) =>
    `div id="${uuid()}" data-component-type="tabs" name="${name}"></div>`;
  const getHtmlTabElement = (name?: string) =>
    `<div id="${uuid()}" data-component-type="tab" name="${name}"></div>`;
  const getHtmlVideoElement = (name?: string) =>
    `<div id="${uuid()}" data-component-type="${
      HtmlComponentType.VIDEO
    }" name="${name}" style="position: relative;"><video><source src="@resources/${uuid()}"></video>${getHtmlVideoControlsElement(
      name
    )}</div>`;
  const getHtmlImageButtonElement = (name?: string) =>
    `<button id="${uuid()}" data-component-type="${
      HtmlComponentType.IMAGE_BUTTON
    }" name="${name}" style="padding: 0; background-color: @resources/${uuid()};"><img src="@resources/${uuid()}" style="width: 100%; height: 100%;"/></button>`;
  const getHtmlVideoControlsElement = (name = "video") =>
    `<div id="${uuid()}" name="${name}-hallinta" data-component-type="${
      HtmlComponentType.VIDEO_CONTROLS
    }" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-image: @resources/${uuid()}; background-color: @resources/${uuid()}"></div>`;

  export const handleAttributeChange = (
    element: HTMLElement,
    attribute: string,
    value: string
  ): HTMLElement => {
    if (!value) {
      element.removeAttribute(attribute);
    } else {
      element.setAttribute(attribute, value);
    }

    return element;
  };

  export const handleStyleAttributeChange = (
    element: HTMLElement,
    styleAttribute: string,
    value?: string
  ): HTMLElement => {
    const styles = parseStyles(element);
    if (!value) {
      delete styles[styleAttribute];
    } else {
      styles[styleAttribute] = value;
    }

    return updateStyles(element, styles);
  };
  /**
   * Parses html elements styles and returns a map of styles
   *
   * @param element html element
   * @returns map of styles
   */
  export const parseStyles = (element: HTMLElement) => {
    const styles = element.attributes.getNamedItem("style")?.value?.split(";");
    if (!styles) {
      return {};
    }
    const styleMap: { [key: string]: string } = {};
    for (const style of styles) {
      const [key, value] = style.split(":");
      if (key && value) {
        if (key === "max-width") continue;
        styleMap[key.trim()] = value.trim();
      }
    }

    return styleMap;
  };

  /**
   * Updates html elements styles
   *
   * @param styles map of styles
   * @returns serialized element
   */
  export const updateStyles = (element: HTMLElement, styles: { [key: string]: string }) => {
    const styleString = `${Object.entries(styles)
      .map(([key, value]) => `${key}: ${value}`)
      .join("; ")};`;
    +element.setAttribute("style", styleString);

    return element;
  };

  export const ALIGNMENT_MAP = {
    nw: {
      row: {
        "justify-content": "flex-start",
        "justify-items": "flex-start",
        "align-items": "flex-start"
      },
      column: {
        "justify-content": "flex-start",
        "justify-items": "flex-start",
        "align-items": "flex-start"
      }
    },
    n: {
      row: {
        "justify-content": "center",
        "justify-items": "center",
        "align-items": "flex-start"
      },
      column: {
        "justify-content": "flex-start",
        "justify-items": "flex-start",
        "align-items": "center"
      }
    },
    ne: {
      row: {
        "justify-content": "flex-end",
        "justify-items": "flex-end",
        "align-items": "flex-start"
      },
      column: {
        "justify-content": "flex-start",
        "justify-items": "flex-start",
        "align-items": "flex-end"
      }
    },
    w: {
      row: {
        "justify-content": "flex-start",
        "justify-items": "flex-start",
        "align-items": "center"
      },
      column: {
        "justify-content": "center",
        "justify-items": "center",
        "align-items": "flex-start"
      }
    },
    c: {
      row: {
        "justify-content": "center",
        "justify-items": "center",
        "align-items": "center"
      },
      column: {
        "justify-content": "center",
        "justify-items": "center",
        "align-items": "center"
      }
    },
    e: {
      row: {
        "justify-content": "flex-end",
        "justify-items": "flex-end",
        "align-items": "center"
      },
      column: {
        "justify-content": "center",
        "justify-items": "center",
        "align-items": "flex-end"
      }
    },
    sw: {
      row: {
        "justify-content": "flex-start",
        "justify-items": "flex-start",
        "align-items": "flex-end"
      },
      column: {
        "justify-content": "flex-end",
        "justify-items": "flex-end",
        "align-items": "flex-start"
      }
    },
    s: {
      row: {
        "justify-content": "center",
        "justify-items": "center",
        "align-items": "flex-end"
      },
      column: {
        "justify-content": "flex-end",
        "justify-items": "flex-end",
        "align-items": "center"
      }
    },
    se: {
      row: {
        "justify-content": "flex-end",
        "justify-items": "flex-end",
        "align-items": "flex-end"
      },
      column: {
        "justify-content": "flex-end",
        "justify-items": "flex-end",
        "align-items": "flex-end"
      }
    }
  };

  /**
   * Base font size for default fonts
   */
  export const BASE_FONT_SIZE = 16;

  /**
   * Default font sizes depending on HTML text component type
   */
  export const DEFAULT_FONT_SIZES = {
    [HtmlTextComponentType.H1]: BASE_FONT_SIZE * 2,
    [HtmlTextComponentType.H2]: BASE_FONT_SIZE * 1.5,
    [HtmlTextComponentType.H3]: BASE_FONT_SIZE * 1.17,
    [HtmlTextComponentType.H4]: BASE_FONT_SIZE,
    [HtmlTextComponentType.H5]: BASE_FONT_SIZE * 0.83,
    [HtmlTextComponentType.H6]: BASE_FONT_SIZE * 0.67,
    [HtmlTextComponentType.P]: BASE_FONT_SIZE,
    [HtmlTextComponentType.BUTTON]: BASE_FONT_SIZE
  };

  /**
   * Gets font size or default font size if no font size is set
   */
  export const getFontSize = (component: TreeObject) => {
    const fontSize = component.element?.style.fontSize;
    const defaultFontSize =
      HtmlComponentsUtils.DEFAULT_FONT_SIZES[
        component.element.tagName as keyof typeof HtmlTextComponentType
      ];

    if (!fontSize) {
      return Math.round(defaultFontSize);
    }

    return parseInt(fontSize);
  };

  /**
   * Default text align
   */
  export const DEFAULT_TEXT_ALIGNMENT = TextAlignment.LEFT;

  /**
   * Default paragraph font
   */
  export const DEFAULT_PARAGRAPH_FONT = AvailableFonts.SOURCE_SANS_PRO_REGULAR;

  /**
   * Default header font
   */
  export const DEFAULT_HEADER_FONT = AvailableFonts.LARKEN_MEDIUM;

  /**
   * Default line-height
   */
  export const DEFAULT_LINE_HEIGHT = 1.2;

  /**
   * Components that don't support proportions as percentages
   */
  export const COMPONENTS_WITHOUT_PERCENTAGE_PROPORTIONS = [
    HtmlComponentType.IMAGE,
    HtmlComponentType.VIDEO,
    HtmlComponentType.IMAGE_BUTTON,
    HtmlComponentType.BUTTON
  ];

  /**
   * Components that can be used to play video
   */
  export const PLAY_VIDEO_COMPONENTS = [
    HtmlComponentType.BUTTON,
    HtmlComponentType.IMAGE_BUTTON,
    HtmlComponentType.IMAGE
  ];
}

export default HtmlComponentsUtils;
