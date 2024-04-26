import {
  ExhibitionPageResourceType,
  PageLayout,
  PageResourceMode
} from "../../../generated/client";
import strings from "../../../localization/strings";
import { GroupedInputsType, HtmlComponentType, TreeObject } from "../../../types";
import HtmlComponentsUtils from "../../../utils/html-components-utils";
import HtmlResourceUtils from "../../../utils/html-resource-utils";
import LocalizationUtils from "../../../utils/localization-utils";
import SelectBox from "../../generic/v2/select-box";
import TextField from "../../generic/v2/text-field";
import ColorPicker from "./color-picker";
import GroupedInputsWithLock from "./grouped-inputs-with-lock";
import PanelSubtitle from "./panel-subtitle";
import PropertyBox from "./property-box";
import ProportionsEditorHtml from "./proportions-editor-html";
import {
  Close as CloseIcon,
  FormatColorFillOutlined as FormatColorFillOutlinedIcon,
  PaletteOutlined as PaletteOutlinedIcon
} from "@mui/icons-material";
import { Button, Divider, IconButton, MenuItem, Stack } from "@mui/material";
import React, { ChangeEvent, useState } from "react";
import { ColorResult } from "react-color";

/**
 * Component props
 */
interface Props {
  component: TreeObject;
  pageLayout: PageLayout;
  updateComponent: (updatedComponent: TreeObject) => void;
  setPageLayout: (foundLayout: PageLayout) => void;
}

/**
 * Generic Component Properties
 */
const GenericComponentProperties = ({
  component,
  pageLayout,
  updateComponent,
  setPageLayout
}: Props) => {
  const [popoverAnchorElement, setPopoverAnchorElement] = useState<HTMLButtonElement>();

  if (!component) return null;

  /**
   * Event handler for property change events
   *
   * @param name name
   * @param value value
   */
  const onPropertyChange = (name: string, value: string) => {
    let { element } = component;
    const dimensionAttributes = ["width", "height"];
    const dataComponentType = element.attributes.getNamedItem("data-component-type")?.value;
    element = HtmlComponentsUtils.handleStyleAttributeChange(element, name, value);

    if (dataComponentType === HtmlComponentType.VIDEO && dimensionAttributes.includes(name)) {
      const videoChild = element.getElementsByTagName("video")[0];
      HtmlComponentsUtils.handleAttributeChange(videoChild, name, value.replace(/(px)|%/g, ""));
    }
    updateComponent({ ...component, element: element });
  };

  /**
   * Returns text resource path
   *
   * @returns text resource path
   */
  const getBackgroundColorResourcePath = () => {
    const { element } = component;
    const styles = HtmlComponentsUtils.parseStyles(element);

    return styles["background-color"];
  };

  /**
   * Returns background color
   *
   * @returns background color
   */
  const getElementBackgroundColor = () => {
    const backgroundColorString = HtmlResourceUtils.getResourceData(
      pageLayout.defaultResources,
      getBackgroundColorResourcePath()
    );

    return backgroundColorString;
  };

  /**
   * Event handler for background color change events
   *
   * @param color color
   */
  const handleBackgroundColorChange = ({ rgb }: ColorResult) => {
    const { r, g, b, a } = rgb;
    const resourcePath = getBackgroundColorResourcePath();
    const resourceId = HtmlResourceUtils.getResourceId(resourcePath);
    if (!resourceId) return;

    const defaultResources = [
      ...(pageLayout.defaultResources || []).filter((resource) => resource.id !== resourceId),
      {
        id: resourceId,
        data: `rgba(${r}, ${g}, ${b}, ${a ?? 1})`,
        type: ExhibitionPageResourceType.Color,
        mode: PageResourceMode.Static
      }
    ];

    setPageLayout({
      ...pageLayout,
      defaultResources: defaultResources
    });
  };

  /**
   * Event handler for background remove events
   */
  const handleBackgroundRemove = () => {
    const resourcePath = getBackgroundColorResourcePath();
    const resourceId = HtmlResourceUtils.getResourceId(resourcePath);
    if (!resourceId) return;

    const defaultResources = [
      ...(pageLayout.defaultResources || []).filter((resource) => resource.id !== resourceId),
      {
        id: resourceId,
        data: "transparent",
        type: ExhibitionPageResourceType.Color,
        mode: PageResourceMode.Static
      }
    ];

    setPageLayout({
      ...pageLayout,
      defaultResources: defaultResources
    });
  };

  const getElementWidth = () => {
    const { element } = component;
    const { tagName } = element;
    const styles = HtmlComponentsUtils.parseStyles(element);
    if (tagName.toLowerCase() === HtmlComponentType.VIDEO) {
      const width = component.element.attributes
        .getNamedItem("width")
        ?.value.replace(/(px)|%/g, "");
      if (!width) return;
      return parseInt(width);
    }
    const width = styles["width"]?.replace(/(px)|%/g, "");
    if (!width) return;
    return parseInt(width) || undefined;
  };

  const getElementHeight = () => {
    const { element } = component;
    const { tagName } = element;
    const styles = HtmlComponentsUtils.parseStyles(element);
    if (tagName.toLowerCase() === HtmlComponentType.VIDEO) {
      const height = component.element.attributes
        .getNamedItem("height")
        ?.value.replace(/(px)|%/g, "");
      if (!height) return;
      return parseInt(height);
    }
    const height = styles["height"]?.replace(/(px)|%/g, "");
    if (!height) return;
    return parseInt(height) || undefined;
  };
  /**
   * Event handler for name change events
   *
   * @param event event
   */
  const onNameChange = ({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
    component.element.setAttribute("name", value);
    updateComponent(component);
  };

  /**
   * Gets elements background icon colors
   */
  const getElementsBackgroundIconColors = () => {
    const backgroundColor = getElementBackgroundColor();

    return {
      border: backgroundColor ? undefined : "1px solid #2196F3",
      backgroundColor: backgroundColor || "#F5F5F5"
    };
  };

  /**
   * Renders background color remove button
   */
  const renderBackgroundColorRemoveButton = () => {
    const backgroundColor = getElementBackgroundColor();
    const buttonStyle = {
      visibility: backgroundColor ? "visible" : "hidden"
    };

    return (
      <IconButton onClick={handleBackgroundRemove} sx={buttonStyle}>
        <CloseIcon />
      </IconButton>
    );
  };

  /**
   * Renders background color indicator
   */
  const renderBackgroundColorIndicator = () => (
    <span
      style={{
        width: 16,
        height: 16,
        borderRadius: 4,
        ...getElementsBackgroundIconColors()
      }}
    />
  );

  return (
    <>
      <Stack spacing={2} paddingLeft={0} paddingRight={0}>
        <PropertyBox>
          <PanelSubtitle subtitle={strings.layoutEditorV2.genericProperties.element} />
          <SelectBox value={component.type} disabled>
            {Object.values(HtmlComponentType).map((type) => (
              <MenuItem key={type} value={type} sx={{ color: "#2196F3" }}>
                {LocalizationUtils.getLocalizedComponentType(type)}
              </MenuItem>
            ))}
          </SelectBox>
        </PropertyBox>
        <Divider sx={{ color: "#F5F5F5" }} />
        <PropertyBox>
          <PanelSubtitle subtitle={strings.layoutEditorV2.genericProperties.elementName} />
          <TextField
            value={component.element.attributes.getNamedItem("name")?.nodeValue || ""}
            onChange={onNameChange}
            placeholder={strings.layoutEditorV2.genericProperties.elementName}
          />
        </PropertyBox>
        <Divider sx={{ color: "#F5F5F5" }} />
        <PropertyBox>
          <PanelSubtitle subtitle={strings.layoutEditorV2.genericProperties.proportions} />
          <ProportionsEditorHtml
            component={component}
            value={getElementWidth()}
            name="width"
            label={strings.layoutEditorV2.genericProperties.width}
            onChange={onPropertyChange}
          />
          <ProportionsEditorHtml
            component={component}
            value={getElementHeight()}
            name="height"
            label={strings.layoutEditorV2.genericProperties.height}
            onChange={onPropertyChange}
          />
        </PropertyBox>
        <Divider sx={{ color: "#F5F5F5" }} />
        <PropertyBox>
          <PanelSubtitle subtitle={strings.layoutEditorV2.genericProperties.margin} />
          <GroupedInputsWithLock
            styles={HtmlComponentsUtils.parseStyles(component.element)}
            type={GroupedInputsType.MARGIN}
            onChange={onPropertyChange}
          />
        </PropertyBox>
        <Divider sx={{ color: "#F5F5F5" }} />
        <PropertyBox>
          <PanelSubtitle subtitle={strings.layoutEditorV2.genericProperties.padding} />
          <GroupedInputsWithLock
            styles={HtmlComponentsUtils.parseStyles(component.element)}
            type={GroupedInputsType.PADDING}
            onChange={onPropertyChange}
          />
        </PropertyBox>
        <Divider sx={{ color: "#F5F5F5" }} />
        <PropertyBox>
          <Stack direction="row" alignItems="center" spacing={1}>
            <PaletteOutlinedIcon sx={{ opacity: 0.54 }} />
            <PanelSubtitle subtitle={strings.layoutEditorV2.genericProperties.color.label} />
          </Stack>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Button
              sx={{ color: "#2196F3" }}
              onClick={({ currentTarget }: React.MouseEvent<HTMLButtonElement>) =>
                setPopoverAnchorElement(currentTarget)
              }
            >
              {strings.layoutEditorV2.genericProperties.color.button}
            </Button>
            {renderBackgroundColorRemoveButton()}
            {renderBackgroundColorIndicator()}
            <FormatColorFillOutlinedIcon sx={{ color: "#2196F3" }} />
          </Stack>
        </PropertyBox>
      </Stack>
      <ColorPicker
        color={getElementBackgroundColor()}
        anchorEl={popoverAnchorElement}
        popover
        onClose={() => setPopoverAnchorElement(undefined)}
        onChangeComplete={handleBackgroundColorChange}
      />
    </>
  );
};

export default GenericComponentProperties;
