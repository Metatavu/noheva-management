import {
  ExhibitionPageResourceType,
  PageLayout,
  PageResourceMode
} from "../../../generated/client";
import strings from "../../../localization/strings";
import { AvailableFonts, HtmlTextComponentType, TextAlignment, TreeObject } from "../../../types";
import HtmlComponentsUtils from "../../../utils/html-components-utils";
import HtmlResourceUtils from "../../../utils/html-resource-utils";
import LocalizationUtils from "../../../utils/localization-utils";
import SelectBox from "../../generic/v2/select-box";
import TextField from "../../generic/v2/text-field";
import FontColorEditor from "./font-color-editor";
import PanelSubtitle from "./panel-subtitle";
import PropertyBox from "./property-box";
import {
  FormatAlignCenter,
  FormatAlignJustify,
  FormatAlignLeft,
  FormatAlignRight
} from "@mui/icons-material";
import {
  Divider,
  MenuItem,
  Slider,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography
} from "@mui/material";
import { ChangeEvent, MouseEvent, ReactNode } from "react";

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
 * Interface representing text alignment options
 */
interface TextAlignmentOption {
  value: TextAlignment;
  icon: ReactNode;
}

/**
 * Text Component Properties component
 */
const TextComponentProperties = ({
  component,
  updateComponent,
  pageLayout,
  setPageLayout
}: Props) => {
  const textAlignmentOptions: TextAlignmentOption[] = [
    {
      value: TextAlignment.LEFT,
      icon: <FormatAlignLeft />
    },
    {
      value: TextAlignment.CENTER,
      icon: <FormatAlignCenter />
    },
    {
      value: TextAlignment.RIGHT,
      icon: <FormatAlignRight />
    },
    {
      value: TextAlignment.JUSTIFY,
      icon: <FormatAlignJustify />
    }
  ];

  /**
   * Returns text resource path
   *
   * @returns text resource path
   */
  const getTextResourcePath = () => {
    const { element } = component;
    return element.innerHTML;
  };

  /**
   * Returns text
   *
   * @returns text
   */
  const getText = () => {
    return HtmlResourceUtils.getResourceData(pageLayout.defaultResources, getTextResourcePath());
  };

  /**
   * Event handler for element change events
   *
   * @param value value
   */
  const handleElementChange = ({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
    const updatedHTMLTag = document.createElement(value);

    for (const attribute of component.element.attributes) {
      updatedHTMLTag.setAttribute(attribute.name, attribute.value);
    }

    for (const style of component.element.style) {
      updatedHTMLTag.style.setProperty(style, component.element.style.getPropertyValue(style));
    }
    updatedHTMLTag.innerHTML = component.element.innerHTML;

    updateComponent({
      ...component,
      element: updatedHTMLTag
    });
  };

  /**
   * Event handler for default resource change event
   *
   * @param event event
   */
  const handleDefaultResourceChange = ({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
    const resourcePath = getTextResourcePath();
    const resourceId = HtmlResourceUtils.getResourceId(resourcePath);
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
   * Event handler for line height change events
   *
   * @param newValue value
   */
  const onLineHeightChange = (_: any, newValue: number | number[]) => {
    if (!newValue) {
      component.element.style.removeProperty("line-height");
    } else {
      component.element.style.setProperty("line-height", newValue.toString());
    }
    updateComponent(component);
  };

  /**
   * Event handler for letter spacing change events
   *
   * @param newValue value
   */
  const onLetterSpacingChange = (_: any, newValue: number | number[]) => {
    if (!newValue) {
      component.element.style.removeProperty("letter-spacing");
    } else {
      component.element.style.setProperty("letter-spacing", newValue.toString());
    }
    updateComponent(component);
  };

  /**
   * Event handler for text alignment change events
   *
   * @param event event
   * @param value value
   */
  const onTextAlignmentChange = (_: MouseEvent, value: string) => {
    if (!value) {
      component.element.style.removeProperty("text-align");
    } else {
      component.element.style.setProperty("text-align", value);
    }
    updateComponent(component);
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
   * Gets line height
   */
  const getLineHeight = () => {
    const lineHeight = component.element?.style.lineHeight;

    if (!lineHeight) {
      return HtmlComponentsUtils.DEFAULT_LINE_HEIGHT;
    }

    return parseFloat(lineHeight);
  };

  /**
   * Gets letter spacing
   */
  const getLetterSpacing = () => {
    const letterSpacing = component.element?.style.letterSpacing;
    if (!letterSpacing) {
      return HtmlComponentsUtils.DEFAULT_LETTER_SPACING;
    }
    return parseFloat(letterSpacing);
  };

  /**
   * Gets text alignment
   */
  const getTextAlignment = () => {
    const textAlign = component.element?.style.textAlign;

    if (!textAlign) {
      return HtmlComponentsUtils.DEFAULT_TEXT_ALIGNMENT;
    }

    return textAlign;
  };

  /**
   * Gets font
   */
  const getFont = () => {
    const {
      style: { fontFamily },
      tagName
    } = component.element;

    if (!fontFamily) {
      switch (tagName) {
        case HtmlTextComponentType.P:
          return HtmlComponentsUtils.DEFAULT_PARAGRAPH_FONT;
        default:
          return HtmlComponentsUtils.DEFAULT_HEADER_FONT;
      }
    }
    return fontFamily;
  };

  /**
   * Renders text alignment toggle button
   *
   * @param option option
   */
  const renderTextAlignmentToggleButton = (option: TextAlignmentOption) => (
    <ToggleButton key={option.value} value={option.value}>
      {option.icon}
    </ToggleButton>
  );

  /**
   * Renders font menu items
   *
   * @param font font
   */
  const renderFontMenuItem = (font: AvailableFonts) => {
    return (
      <MenuItem key={font} value={font}>
        {font}
      </MenuItem>
    );
  };

  return (
    <Stack>
      <Divider sx={{ color: "#F5F5F5" }} />
      <PropertyBox>
        <PanelSubtitle subtitle={strings.layoutEditorV2.textProperties.elementType} />
        <SelectBox value={component.element.tagName} onChange={handleElementChange}>
          {Object.values(HtmlTextComponentType).map((type) => (
            <MenuItem key={type} value={type} sx={{ color: "#2196F3" }}>
              {LocalizationUtils.getLocalizedTextComponentType(type)}
            </MenuItem>
          ))}
        </SelectBox>
      </PropertyBox>
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
        <PanelSubtitle subtitle={strings.layoutEditorV2.textProperties.lineHeight} />
        <Stack direction="row" spacing={2}>
          <Slider
            value={getLineHeight()}
            onChange={onLineHeightChange}
            valueLabelDisplay="auto"
            step={0.1}
            color="secondary"
            min={0}
            max={5}
          />
          <Typography variant="caption">{getLineHeight()}</Typography>
        </Stack>
      </PropertyBox>
      <Divider sx={{ color: "#F5F5F5" }} />
      <PropertyBox>
        <PanelSubtitle subtitle={strings.layoutEditorV2.textProperties.letterSpacing} />
        <Stack direction="row" spacing={2}>
          <Slider
            value={getLetterSpacing()}
            onChange={onLetterSpacingChange}
            valueLabelDisplay="auto"
            step={0.1}
            color="secondary"
            min={0}
            max={5}
          />
          <Typography variant="caption">{getLetterSpacing()}</Typography>
        </Stack>
      </PropertyBox>
      <Divider sx={{ color: "#F5F5F5" }} />
      <PropertyBox>
        <PanelSubtitle subtitle={strings.layoutEditorV2.textProperties.textAlign} />
        <ToggleButtonGroup
          value={getTextAlignment()}
          exclusive
          onChange={onTextAlignmentChange}
          size="small"
          fullWidth
        >
          {textAlignmentOptions.map(renderTextAlignmentToggleButton)}
        </ToggleButtonGroup>
      </PropertyBox>
      <Divider sx={{ color: "#F5F5F5" }} />
      <PropertyBox>
        <PanelSubtitle subtitle={strings.layoutEditorV2.textProperties.font} />
        <SelectBox value={getFont()} onChange={onFontChange}>
          {Object.values(AvailableFonts).map(renderFontMenuItem)}
        </SelectBox>
      </PropertyBox>
      <Divider sx={{ color: "#F5F5F5" }} />
      <FontColorEditor component={component} updateComponent={updateComponent} />
      <PropertyBox>
        <PanelSubtitle subtitle={strings.layoutEditorV2.textProperties.defaultResource} />
        <TextField
          value={getText()}
          onChange={handleDefaultResourceChange}
          placeholder={strings.layoutEditorV2.textProperties.defaultResource}
        />
      </PropertyBox>
      <Divider sx={{ color: "#F5F5F5" }} />
    </Stack>
  );
};

export default TextComponentProperties;
