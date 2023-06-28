import strings from "../localization/strings";
import { HtmlComponentType, HtmlTextComponentType, LayoutAlignment } from "../types";

/**
 * Namespace containing localization utilities
 */
namespace LocalizationUtils { 
  /**
   * Returns localized layout alignment text
   * 
   * @param alignment alignment
   */
  export const getLocalizedLayoutAlignment = (alignment: LayoutAlignment) => ({
    [LayoutAlignment.NORTH_WEST]: strings.layout.htmlProperties.genericProperties.alignment.northwest,
    [LayoutAlignment.NORTH]: strings.layout.htmlProperties.genericProperties.alignment.north,
    [LayoutAlignment.NORTH_EAST]: strings.layout.htmlProperties.genericProperties.alignment.northeast,
    [LayoutAlignment.WEST]: strings.layout.htmlProperties.genericProperties.alignment.west,
    [LayoutAlignment.CENTER]: strings.layout.htmlProperties.genericProperties.alignment.center,
    [LayoutAlignment.EAST]: strings.layout.htmlProperties.genericProperties.alignment.east,
    [LayoutAlignment.SOUTH_WEST]: strings.layout.htmlProperties.genericProperties.alignment.southwest,
    [LayoutAlignment.SOUTH]: strings.layout.htmlProperties.genericProperties.alignment.south,
    [LayoutAlignment.SOUTH_EAST]: strings.layout.htmlProperties.genericProperties.alignment.southeast
  })[alignment]
  
  /**
   * Returns localized component type
   * 
   * @param componentType component type
   */
  export const getLocalizedComponentType = (componentType: HtmlComponentType) => ({
    [HtmlComponentType.LAYOUT]: strings.layout.html.types.layout,
    [HtmlComponentType.BUTTON]: strings.layout.html.types.button,
    [HtmlComponentType.IMAGE]: strings.layout.html.types.image,
    [HtmlComponentType.TEXT]: strings.layout.html.types.text,
    [HtmlComponentType.TABS]: strings.layout.html.types.tabs,
    [HtmlComponentType.TAB]: strings.layout.html.types.tab
  })[componentType]

  /**
   * Return localized help text according to selected component
   * 
   * @param componentType component type
   */
  export const getLocalizedNewComponentHelpText = (componentType: HtmlComponentType) => ({
    [HtmlComponentType.LAYOUT]: strings.helpTexts.layoutEditorHtml.layoutDescription,
    [HtmlComponentType.BUTTON]: strings.helpTexts.layoutEditorHtml.buttonDescription,
    [HtmlComponentType.IMAGE]: strings.helpTexts.layoutEditorHtml.imageViewDescription,
    [HtmlComponentType.TEXT]: strings.helpTexts.layoutEditorHtml.textViewDescription,
    [HtmlComponentType.TABS]: strings.helpTexts.layoutEditorHtml.tabsViewDescription,
    [HtmlComponentType.TAB]: strings.helpTexts.layoutEditorHtml.tabViewDescription
  })[componentType]
  
  /**
   * Returns localized text component type
   * 
   * @param textComponentType text component type
   */
  export const getLocalizedTextComponentType = (textComponentType: HtmlTextComponentType) => ({
    [HtmlTextComponentType.H1]: strings.layout.html.textTypes.heading1,
    [HtmlTextComponentType.H2]: strings.layout.html.textTypes.heading2,
    [HtmlTextComponentType.H3]: strings.layout.html.textTypes.heading3,
    [HtmlTextComponentType.H4]: strings.layout.html.textTypes.heading4,
    [HtmlTextComponentType.H5]: strings.layout.html.textTypes.heading5,
    [HtmlTextComponentType.H6]: strings.layout.html.textTypes.heading6,
    [HtmlTextComponentType.P]: strings.layout.html.textTypes.body,
  })[textComponentType];
}

export default LocalizationUtils;