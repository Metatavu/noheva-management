import {
  ExhibitionPageResourceType,
  PageLayout,
  PageResourceMode
} from "../../../generated/client";
import strings from "../../../localization/strings";
import { AvailableFonts, GroupedInputsType, TreeObject } from "../../../types";
import HtmlComponentsUtils from "../../../utils/html-components-utils";
import HtmlResourceUtils from "../../../utils/html-resource-utils";
import SelectBox from "../../generic/v2/select-box";
import TextField from "../../generic/v2/text-field";
import FontColorEditor from "./font-color-editor";
import GroupedInputsWithLock from "./grouped-inputs-with-lock";
import PanelSubtitle from "./panel-subtitle";
import PropertyBox from "./property-box";
import { Divider, MenuItem, Stack } from "@mui/material";
import { ChangeEvent } from "react";

/**
 * Component props
 */
interface Props {
  component: TreeObject;
  updateComponent: (updatedComponent: TreeObject) => void;
  pageLayout: PageLayout;
  setPageLayout: (foundLayout: PageLayout) => void;
}

/**
 * Button Component Properties component
 */
const ButtonComponentProperties = ({
  component,
  updateComponent,
  pageLayout,
  setPageLayout
}: Props) => {
  /**
   * Returns button resource path
   *
   * @returns button resource path
   */
  const getButtonResourcePath = () => {
    const { element } = component;
    return element.innerHTML;
  };

  /**
   * Returns button text
   *
   * @returns button text
   */
  const getButtonText = () => {
    return HtmlResourceUtils.getResourceData(pageLayout.defaultResources, getButtonResourcePath());
  };

  /**
   * Gets font
   */
  const getFont = () => {
    const {
      style: { fontFamily }
    } = component.element;

    if (!fontFamily) {
      return HtmlComponentsUtils.DEFAULT_PARAGRAPH_FONT;
    }
    return fontFamily;
  };

  /**
   * Event handler for default resource change event
   *
   * @param event event
   */
  const handleDefaultResourceChange = ({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
    const ressourcePath = getButtonResourcePath();
    const resourceId = HtmlResourceUtils.getResourceId(ressourcePath);
    if (!resourceId) return;

    const defaultResources = [
      ...(pageLayout.defaultResources || []).filter((resource) => resource.id !== resourceId),
      {
        id: resourceId,
        data: value,
        type: ExhibitionPageResourceType.Text,
        mode: PageResourceMode.Static
      }
    ];

    setPageLayout({
      ...pageLayout,
      defaultResources: defaultResources
    });
  };

  /**
   * Event handler for font change events
   *
   * @param event event
   */
  const onFontChange = ({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
    component.element.style.setProperty("font-family", value);
    updateComponent(component);
  };

  /**
   * Event handler for property change events
   *
   * @param name name
   * @param value value
   */
  const onBorderRadiusChange = (name: string, value: string) => {
    const element = HtmlComponentsUtils.handleStyleAttributeChange(component.element, name, value);

    updateComponent({ ...component, element: element });
  };

  /**
   * Event handler for font size change events
   *
   * @param name name
   * @param value value
   */
  const onFontSizeChange = ({ target: { name, value } }: ChangeEvent<HTMLInputElement>) => {
    if (!value) {
      component.element.style.fontSize = "0px";
    } else {
      component.element.style[name as any] = `${value}px`;
    }
    updateComponent(component);
  };

  /**
   * Renders font menu items
   *
   * @param font font
   */
  const renderFontMenuItem = (font: any) => {
    return (
      <MenuItem key={font} value={font}>
        {font}
      </MenuItem>
    );
  };

  return (
    <Stack>
      <Divider sx={{ color: "#F5F5F5" }} />
      <FontColorEditor component={component} updateComponent={updateComponent} />
      <Divider sx={{ color: "#F5F5F5" }} />
      <PropertyBox>
        <PanelSubtitle subtitle={strings.layoutEditorV2.textProperties.fontSize} />
        <TextField
          value={HtmlComponentsUtils.getFontSize(component)}
          name="font-size"
          number
          onChange={onFontSizeChange}
        />
      </PropertyBox>
      <Divider sx={{ color: "#F5F5F5" }} />
      <PropertyBox>
        <PanelSubtitle subtitle={strings.layoutEditorV2.genericProperties.borderRadius} />
        <GroupedInputsWithLock
          styles={HtmlComponentsUtils.parseStyles(component.element)}
          type={GroupedInputsType.BORDER_RADIUS}
          onChange={onBorderRadiusChange}
        />
      </PropertyBox>
      <Divider sx={{ color: "#F5F5F5" }} />
      <PropertyBox>
        <PanelSubtitle subtitle={strings.layoutEditorV2.buttonProperties.defaultResource} />
        <TextField
          value={getButtonText()}
          onChange={handleDefaultResourceChange}
          placeholder={strings.layoutEditorV2.buttonProperties.defaultResource}
        />
      </PropertyBox>
      <Divider sx={{ color: "#F5F5F5" }} />
      <PropertyBox>
        <PanelSubtitle subtitle={strings.layoutEditorV2.buttonProperties.font} />
        <SelectBox value={getFont()} onChange={onFontChange}>
          {Object.values(AvailableFonts).map(renderFontMenuItem)}
        </SelectBox>
      </PropertyBox>
      <Divider sx={{ color: "#F5F5F5" }} />
    </Stack>
  );
};

export default ButtonComponentProperties;
