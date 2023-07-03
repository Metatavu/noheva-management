import React, { useState, FC, ChangeEvent } from "react";
import { Button, Divider, MenuItem, Popover, Stack, TextField } from "@mui/material";
import { ColorResult, SketchPicker } from "react-color";
import strings from "../../../../localization/strings";
import { HtmlComponentType, TreeObject } from "../../../../types";
import {
  FormatColorFillOutlined as FormatColorFillOutlinedIcon,
  PaletteOutlined as PaletteOutlinedIcon
} from "@mui/icons-material";
import MarginPaddingEditorHtml from "./margin-padding-editor-html";
import ProportionsEditorHtml from "./proportions-editor-html";
import PropertyBox from "./generic/property-box";
import PanelSubtitle from "./generic/panel-subtitle";
import LanguageUtils from "../../../../utils/language-utils";

/**
 * Component props
 */
interface Props {
  component: TreeObject;
  updateComponent: (updatedComponent: TreeObject) => void;
}

/**
 * Component for Generic Properties
 */
const GenericComponentProperties: FC<Props> = ({
  component,
  updateComponent
}) => {
  const [ popoverAnchorElement, setPopoverAnchorElement ] = useState<HTMLButtonElement>();

  if (!component) return null;

  /**
   * Event handler for property change events
   *
   * @param name name
   * @param value value
   */
  const onPropertyChange = (name: string, value: string) => {
    component.element.style[name as any] = value;
    updateComponent(component);
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
  const getElementBackgroundIconColors = () => {
    const elementsBackgroundColor = component.element.style.backgroundColor;
    
    return {
      border: elementsBackgroundColor ? undefined : "1px solid #2196F3",
      backgroundColor: elementsBackgroundColor || "#F5F5F5"
    }
  };

  return (
    <>
      <Stack spacing={ 2 } paddingLeft={ 0 } paddingRight={ 0 }>
        <PropertyBox>
          <PanelSubtitle subtitle={ strings.layout.htmlProperties.genericProperties.element }/>
          <TextField
            value={ component.type }
            variant="standard"
            select
            fullWidth
            sx={{ backgroundColor: "#F5F5F5" }}
            InputProps={{
                disableUnderline: true,
                sx: {  backgroundColor: "#F5F5F5" }
            }}
            SelectProps={{
              sx: {
                "& .MuiInputBase-input": {
                  color: "#2196F3",
                  height: "20px",
                  padding: 0,
                },
                height: "20px",
                backgroundColor: "#F5F5F5"
              }
            }}
          >
            { Object.values(HtmlComponentType).map(type => (
              <MenuItem
                key={ type }
                value={ type }
                sx={{ color: "#2196F3" }}
              >
                { LanguageUtils.getLocalizedComponentType(type) }
              </MenuItem>
            )) }
          </TextField>
        </PropertyBox>
        <Divider sx={{ color: "#F5F5F5" }}/>
        <PropertyBox>
          <PanelSubtitle subtitle={ strings.layout.htmlProperties.genericProperties.elementName }/>
          <TextField
            variant="standard"
            value={ component.element.attributes.getNamedItem("name")?.nodeValue || "" }
            onChange={ onNameChange }
            inputProps={{
              sx:{ backgroundColor: "#fbfbfb" }
              }}
            placeholder={ strings.layout.htmlProperties.genericProperties.elementName }
          />
        </PropertyBox>
        <Divider sx={{ color: "#F5F5F5" }}/>
        <PropertyBox>
          <PanelSubtitle subtitle={ strings.layout.htmlProperties.genericProperties.proportions}/>
          <ProportionsEditorHtml
            value={ parseInt(component.element?.style?.width || "0").toString() }
            name="width"
            label={ strings.layout.htmlProperties.genericProperties.width }
            onChange={ onPropertyChange }
          />
          <ProportionsEditorHtml
            value={ parseInt(component.element?.style?.height || "0").toString() }
            name="height"
            label={ strings.layout.htmlProperties.genericProperties.height }
            onChange={ onPropertyChange }
          />
        </PropertyBox>
        <Divider sx={{ color: "#F5F5F5" }}/>
        <PropertyBox>
          <PanelSubtitle subtitle={ strings.layout.htmlProperties.genericProperties.margin }/>
          <MarginPaddingEditorHtml
            styles={ component.element.style }
            type="margin"
            onChange={ onPropertyChange }
          />
        </PropertyBox>
        <Divider sx={{ color: "#F5F5F5" }}/>
        <PropertyBox>
          <PanelSubtitle subtitle={ strings.layout.htmlProperties.genericProperties.padding }/>
          <MarginPaddingEditorHtml
            styles={ component.element.style }
            type="padding"
            onChange={ onPropertyChange }
          />
        </PropertyBox>
        <Divider sx={{ color: "#F5F5F5" }}/>
        <PropertyBox>
          <Stack
            direction="row"
            alignItems="center"
            spacing={ 1 }
          >
            <PaletteOutlinedIcon sx={{ opacity: 0.54 }}/>
            <PanelSubtitle subtitle={ strings.layout.htmlProperties.genericProperties.color.label }/>
          </Stack>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <span
              style={{
                width: 16,
                height: 16,
                borderRadius: 4,
                ...getElementBackgroundIconColors()
              }}
            />
            <Button
              sx={{ color: "#2196F3" }}
              onClick={ ({ currentTarget }: React.MouseEvent<HTMLButtonElement>) => setPopoverAnchorElement(currentTarget) }
            >
              { strings.layout.htmlProperties.genericProperties.color.button }
            </Button>
            <FormatColorFillOutlinedIcon sx={{ color: "#2196F3" }}/>
          </Stack>
        </PropertyBox>
      </Stack>
      <Popover
        open={ !!popoverAnchorElement }
        anchorEl={ popoverAnchorElement }
        onClose={ () => setPopoverAnchorElement(undefined) }
        anchorOrigin={{
          vertical: "center",
          horizontal: "left"
        }}
        transformOrigin={{
          vertical: "center",
          horizontal: "right"
        }}
      >
        <SketchPicker
          color={ component.element.style.backgroundColor }
          onChangeComplete={ (color: ColorResult) => onPropertyChange("background-color", color.hex) }
        />
      </Popover>
    </>
  );
}

export default GenericComponentProperties;