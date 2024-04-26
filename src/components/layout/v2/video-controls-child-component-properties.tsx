import strings from "../../../localization/strings";
import { TreeObject } from "../../../types";
import HtmlComponentsUtils from "../../../utils/html-components-utils";
import PropertyBox from "./property-box";
import { Checkbox, Divider, FormControlLabel, Stack } from "@mui/material";
import { ChangeEvent } from "react";

/**
 * Component props
 */
interface Props {
  component: TreeObject;
  updateComponent: (updatedComponent: TreeObject) => void;
}

/**
 * Video Controls Child Component Properties component
 */
const VideoControlsChildComponentProperties = ({ component, updateComponent }: Props) => {
  if (!HtmlComponentsUtils.PLAY_VIDEO_COMPONENTS.includes(component.type)) return null;

  /**
   * Returns true if component has play-video role
   */
  const hasPlayVideoRole = () => {
    const { element } = component;
    return element.getAttribute("data-role") === "play-video";
  };

  /**
   * Handles play button change
   */
  const onPlayButtonChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { element } = component;
    const checked = event.target.checked;

    if (checked) {
      element.setAttribute("data-role", "play-video");
    } else {
      element.removeAttribute("data-role");
    }

    updateComponent({ ...component, element: element });
  };

  return (
    <Stack>
      <Divider sx={{ color: "#F5F5F5" }} />
      <PropertyBox>
        <FormControlLabel
          label={strings.layoutEditorV2.videoControlsChildProperties.startsVideo}
          control={
            <Checkbox
              color="secondary"
              checked={hasPlayVideoRole()}
              onChange={onPlayButtonChange}
            />
          }
        />
      </PropertyBox>
    </Stack>
  );
};

export default VideoControlsChildComponentProperties;
