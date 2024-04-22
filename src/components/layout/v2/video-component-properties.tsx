import {
  ExhibitionPageResourceType,
  PageLayout,
  PageResourceMode
} from "../../../generated/client";
import strings from "../../../localization/strings";
import { TreeObject } from "../../../types";
import HtmlResourceUtils from "../../../utils/html-resource-utils";
import TextField from "../../generic/v2/text-field";
import PanelSubtitle from "./panel-subtitle";
import PropertyBox from "./property-box";
import { Checkbox, Divider, FormControlLabel, Stack } from "@mui/material";
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
 * Video Component Properties component
 */
const VideoComponentProperties = ({
  component,
  updateComponent,
  pageLayout,
  setPageLayout
}: Props) => {
  /**
   * Returns video resource path
   *
   * @returns video resource path
   */
  const getVideoResourcePath = () => {
    const { element } = component;
    const videoElement = element.getElementsByTagName("video")[0];

    if (!videoElement) return "";

    const sourceElement = videoElement.getElementsByTagName("source")[0];

    if (!sourceElement) return "";

    return sourceElement.getAttribute("src") || "";
  };

  /**
   * Returns video src
   *
   * @returns video src
   */
  const getVideo = () => {
    return HtmlResourceUtils.getResourceData(pageLayout.defaultResources, getVideoResourcePath());
  };

  /**
   * Returns whether the video element has autoplay enabled
   */
  const getVideoAutoPlay = () => {
    return getVideoElement().autoplay;
  };

  /**
   * Returns whether the video element has loop enabled
   */
  const getVideoLoop = () => {
    return getVideoElement().loop;
  };

  /**
   * Event handler for default resource change event
   *
   * @param event event
   */
  const handleDefaultResourceChange = ({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
    const resourcePath = getVideoResourcePath();
    const resourceId = HtmlResourceUtils.getResourceId(resourcePath);
    if (!resourceId) return;

    const defaultResources = [
      ...(pageLayout.defaultResources || []).filter((resource) => resource.id !== resourceId),
      {
        id: resourceId,
        data: value,
        type: ExhibitionPageResourceType.Video,
        mode: PageResourceMode.Static
      }
    ];

    setPageLayout({
      ...pageLayout,
      defaultResources: defaultResources
    });
  };

  const getVideoElement = () => {
    const { element } = component;
    return element.getElementsByTagName("video")[0];
  };

  /**
   * Event handler for toggling video autoplay
   */
  const handleToggleVideoProperty = ({
    target: { name, checked }
  }: ChangeEvent<HTMLInputElement>) => {
    const { element } = component;
    const videoElement = getVideoElement();
    if (!videoElement) return;
    switch (name) {
      case "autoplay":
        videoElement.autoplay = checked;
        break;
      case "loop":
        videoElement.loop = checked;
        break;
    }
    updateComponent({ ...component, element: element });
  };

  return (
    <Stack>
      <Divider sx={{ color: "#F5F5F5" }} />
      <PropertyBox>
        <PanelSubtitle subtitle={strings.layoutEditorV2.videoProperties.defaultResource} />
        <TextField
          value={getVideo()}
          onChange={handleDefaultResourceChange}
          placeholder={strings.layoutEditorV2.videoProperties.defaultResource}
        />
      </PropertyBox>
      <Divider sx={{ color: "#F5F5F5" }} />
      <PropertyBox>
        <FormControlLabel
          label={strings.layoutEditorV2.videoProperties.autoPlay}
          control={
            <Checkbox
              name="autoplay"
              color="secondary"
              value={getVideoAutoPlay()}
              onChange={handleToggleVideoProperty}
            />
          }
        />
        <FormControlLabel
          label={strings.layoutEditorV2.videoProperties.loop}
          control={
            <Checkbox
              name="loop"
              color="secondary"
              value={getVideoLoop()}
              onChange={handleToggleVideoProperty}
            />
          }
        />
      </PropertyBox>
    </Stack>
  );
};

export default VideoComponentProperties;
