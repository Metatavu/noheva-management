import { Button, Divider, MenuItem, Stack } from "@mui/material";
import { HtmlTextComponentType, TreeObject } from "../../../types";
import PropertyBox from "./property-box";
import { ChangeEvent, useState } from "react";
import strings from "../../../localization/strings";
import { ExhibitionPageResource, ExhibitionPageResourceType, PageLayout, PageResourceMode } from "../../../generated/client";
import PanelSubtitle from "./panel-subtitle";
import SelectBox from "../../generic/v2/select-box";
import TextField from "../../generic/v2/text-field";
import LocalizationUtils from "../../../utils/localization-utils";
import { ColorResult } from "react-color";
import ColorPicker from "./color-picker";

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
 * Renders text component properties
 */
const TextComponentProperties = ({
  component,
  updateComponent,
  pageLayout,
  setPageLayout
}: Props) => {
  const [ popoverAnchorElement, setPopoverAnchorElement ] = useState<HTMLButtonElement>();

  /**
   * Event handler for element change events
   *
   * @param value value
   */
  const onElementChange = ({ target: { value } } : ChangeEvent<HTMLInputElement>) => {
    const updatedHTMLTag = document.createElement(value);

    for (const attribute of component.element.attributes) {
      updatedHTMLTag.setAttribute(attribute.name, attribute.value);
    }

    updateComponent({
      ...component,
      element: updatedHTMLTag
    });
  };

  /**
   * Get default resource associated with element
   *
   * @returns matchingResource string
   */
  const getElementsDefaultResource = () => {
    if (!pageLayout.defaultResources) return;

    const matchingResource = pageLayout.defaultResources.find(resource => resource.id === component.element.id);

    return matchingResource?.data;
  }

  /**
   * Event handler for default resources change
   *
   * @param event event
   */
  const onDefaultResourcesChange = ({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
    const hasResource = pageLayout.defaultResources?.find(resource => resource.id === component.element.id);

    if (hasResource) {
      const updatedResources = pageLayout.defaultResources?.map(resource => {
        if (resource.id === hasResource.id) {
          resource.data = value;
          return resource;
        }
        return resource;
      });

      setPageLayout({
        ...pageLayout,
        defaultResources: updatedResources
      });
    } else {
      const newResource: ExhibitionPageResource = {
        id: component.element.id,
        data: value,
        type: ExhibitionPageResourceType.Text,
        mode: PageResourceMode.Static
      };

      setPageLayout({
        ...pageLayout,
        defaultResources: [ ...pageLayout.defaultResources ?? [] , newResource ]
      });
    }
  };

  /**
   * Event handler for font color change events
   *
   * @param event event
   */
  const handleFontColorChange = ({ hex }: ColorResult) => {
    const element = component.element;

    element.style.color = hex;

    updateComponent({
      ...component,
      element: element
    });
  };

	return (
    <>
      <Stack>
        <Divider sx={{ color: "#F5F5F5" }}/>
        <PropertyBox>
          <PanelSubtitle subtitle={ strings.layout.htmlProperties.textProperties.elementType }/>
          <SelectBox value={ component.element.tagName } onChange={ onElementChange }>
            { Object.values(HtmlTextComponentType).map(type => (
              <MenuItem
                key={ type }
                value={ type }
                sx={{ color: "#2196F3" }}
              >
                { LocalizationUtils.getLocalizedTextComponentType(type) }
              </MenuItem>
            )) }
          </SelectBox>
        </PropertyBox>
        <Divider sx={{ color: "#F5F5F5" }}/>
        <PropertyBox>
          <PanelSubtitle subtitle={ strings.layout.htmlProperties.textProperties.fontColor }/>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Button
              sx={{ color: "#2196F3" }}
              onClick={ ({ currentTarget }: React.MouseEvent<HTMLButtonElement>) => setPopoverAnchorElement(currentTarget) }
            >
              { strings.layout.htmlProperties.genericProperties.color.button }
            </Button>
          </Stack>
        </PropertyBox>
        <Divider sx={{ color: "#F5F5F5" }}/>
        <PropertyBox>
          <PanelSubtitle subtitle={ strings.layout.htmlProperties.textProperties.defaultResources }/>
          <TextField
            value={ getElementsDefaultResource() || "" }
            onChange={ onDefaultResourcesChange }
            placeholder={ strings.layout.htmlProperties.textProperties.defaultResources }
          />
        </PropertyBox>
        <Divider sx={{ color: "#F5F5F5" }}/>
      </Stack>
      <ColorPicker
        color={ component.element.style.color }
        anchorEl={ popoverAnchorElement }
        onClose={ () => setPopoverAnchorElement(undefined) }
        onChangeComplete={ handleFontColorChange }
      />
    </>
	);
};

export default TextComponentProperties;