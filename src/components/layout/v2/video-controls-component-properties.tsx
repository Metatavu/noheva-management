import strings from "../../../localization/strings";
import { TreeObject } from "../../../types";
import HtmlComponentsUtils from "../../../utils/html-components-utils";
import SelectBox from "../../generic/v2/select-box";
import AlignmentEditorHtml from "./alignment-editor-html";
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
}

/**
 * Video controls component properties
 */
const VideoControlsComponentProperties = ({ component, updateComponent }: Props) => {
  /**
   * Event handler for layout alignment change events
   *
   * @param name name
   * @param value value
   */
  const onAlignmentChange = (name: string, value: string) => {
    console.log("onAlignmentChange");
    HtmlComponentsUtils.handleStyleAttributeChange(component.element, name, value);
    updateComponent(component);
  };

  /**
   * Event handler for property change events
   *
   * @param event event
   */
  const onPropertyChange = ({ target: { value, name } }: ChangeEvent<HTMLInputElement>) => {
    HtmlComponentsUtils.handleStyleAttributeChange(component.element, name, value);

    updateComponent(component);
  };
  return (
    <Stack>
      <Divider sx={{ color: "#F5F5F5" }} />
      <PropertyBox>
        <PanelSubtitle subtitle={strings.layoutEditorV2.layoutProperties.contentEmphasis} />
        <AlignmentEditorHtml onChange={onAlignmentChange} element={component.element} />
      </PropertyBox>
      <Divider sx={{ color: "#F5F5F5" }} />
      <PropertyBox>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <PanelSubtitle
            sx={{ flex: 1 }}
            subtitle={strings.layoutEditorV2.layoutProperties.contentDirection.label}
          />
          <SelectBox
            name="flex-direction"
            sx={{ flex: 1 }}
            value={component.element.style.flexDirection ?? "row"}
            onChange={onPropertyChange}
          >
            <MenuItem value={"row"}>
              {strings.layoutEditorV2.layoutProperties.contentDirection.row}
            </MenuItem>
            <MenuItem value={"column"}>
              {strings.layoutEditorV2.layoutProperties.contentDirection.column}
            </MenuItem>
          </SelectBox>
        </Stack>
      </PropertyBox>
    </Stack>
  );
};

export default VideoControlsComponentProperties;
