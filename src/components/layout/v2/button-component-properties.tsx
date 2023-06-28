import { Divider, Stack } from "@mui/material";
import { TreeObject } from "../../../types";
import PropertyBox from "./property-box";
import { ChangeEvent } from "react";
import strings from "../../../localization/strings";
import { ExhibitionPageResourceType, PageLayout, PageResourceMode } from "../../../generated/client";
import PanelSubtitle from "./panel-subtitle";
import TextField from "../../generic/v2/text-field";
import FontColorEditor from "./font-color-editor";

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
   * Event handler for default resource change event
   *
   * @param event event
   */
  const handleDefaultResourceChange = ({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
    const foundResource = pageLayout.defaultResources?.find(resource => resource.id === component.element.id);
    if (foundResource) {
      setPageLayout({
        ...pageLayout,
        defaultResources: pageLayout.defaultResources?.map(resource => 
          resource.id === foundResource?.id ? { ...resource, data: value } : resource)
      });
    } else {
      setPageLayout({
        ...pageLayout,
        defaultResources: [
          ...pageLayout.defaultResources ?? [], {
            id: component.element.id,
            data: value,
            type: ExhibitionPageResourceType.Text,
            mode: PageResourceMode.Static
          }]
      });
    }
  };

	return (
    <>
      <Stack>
        <Divider sx={{ color: "#F5F5F5" }}/>
        <FontColorEditor
          component={ component }
          updateComponent={ updateComponent }
        />
        <PropertyBox>
          <PanelSubtitle subtitle={ strings.layout.htmlProperties.textProperties.defaultResources }/>
          <TextField
            value={ getElementsDefaultResource() || "" }
            onChange={ handleDefaultResourceChange }
            placeholder={ strings.layout.htmlProperties.textProperties.defaultResources }
          />
        </PropertyBox>
        <Divider sx={{ color: "#F5F5F5" }}/>
      </Stack>
    </>
	);
};

export default ButtonComponentProperties;