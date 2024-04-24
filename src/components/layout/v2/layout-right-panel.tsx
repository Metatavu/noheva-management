import { PageLayout } from "../../../generated/client";
import strings from "../../../localization/strings";
import { ActionButton, HtmlComponentType, TreeObject } from "../../../types";
import HtmlComponentsUtils from "../../../utils/html-components-utils";
import ElementSettingsPane from "../../layouts/element-settings-pane";
import ButtonComponentProperties from "./button-component-properties";
import GenericComponentProperties from "./generic-component-properties";
import ImageButtonComponentProperties from "./image-button-component-properties";
import ImageComponentProperties from "./image-component-properties";
import LayoutComponentProperties from "./layout-component-properties";
import TextComponentProperties from "./text-component-properties";
import VideoComponentProperties from "./video-component-properties";
import VideoControlsChildComponentProperties from "./video-controls-child-component-properties";
import VideoControlsComponentProperties from "./video-controls-component-properties";
import { Menu as MenuIcon } from "@mui/icons-material";

/**
 * Components properties
 */
interface Props {
  component: TreeObject;
  layout: PageLayout;
  setLayout: (layout: PageLayout) => void;
  updateComponent: (component: TreeObject) => void;
  deleteComponent: (component: TreeObject) => void;
  onClose: () => void;
}

/**
 * Layout Right Panel component
 */
const LayoutRightPanel = ({
  component,
  layout,
  setLayout,
  updateComponent,
  deleteComponent,
  onClose
}: Props) => {
  /**
   * Gets panel menu options
   */
  const getPanelMenuOptions = (): ActionButton[] => [
    {
      name: strings.genericDialog.close,
      action: onClose
    },
    {
      name: strings.genericDialog.delete,
      action: () => deleteComponent(component)
    }
  ];

  /**
   * Renders component specific properties
   */
  const renderComponentSpecificProperties = () => {
    switch (component.type) {
      case HtmlComponentType.LAYOUT:
        return (
          <LayoutComponentProperties
            component={component}
            updateComponent={updateComponent}
            pageLayout={layout}
            setPageLayout={setLayout}
          />
        );
      case HtmlComponentType.TEXT:
        return (
          <TextComponentProperties
            component={component}
            updateComponent={updateComponent}
            pageLayout={layout}
            setPageLayout={setLayout}
          />
        );
      case HtmlComponentType.BUTTON:
        return (
          <ButtonComponentProperties
            component={component}
            updateComponent={updateComponent}
            pageLayout={layout}
            setPageLayout={setLayout}
          />
        );
      case HtmlComponentType.IMAGE:
        return (
          <ImageComponentProperties
            component={component}
            updateComponent={updateComponent}
            pageLayout={layout}
            setPageLayout={setLayout}
          />
        );
      case HtmlComponentType.VIDEO:
        return (
          <VideoComponentProperties
            component={component}
            updateComponent={updateComponent}
            pageLayout={layout}
            setPageLayout={setLayout}
          />
        );
      case HtmlComponentType.IMAGE_BUTTON:
        return (
          <ImageButtonComponentProperties
            component={component}
            updateComponent={updateComponent}
            pageLayout={layout}
            setPageLayout={setLayout}
          />
        );
      case HtmlComponentType.VIDEO_CONTROLS:
        return (
          <VideoControlsComponentProperties
            component={component}
            updateComponent={updateComponent}
          />
        );
    }
  };

  /**
   * Renders video controls child properties
   */
  const renderVideoControlsChildProperties = () => {
    const isInsideVideoControls =
      HtmlComponentsUtils.checkIfComponentIsInsideVideoControls(component);
    if (!isInsideVideoControls) return null;

    return (
      <VideoControlsChildComponentProperties
        component={component}
        updateComponent={updateComponent}
      />
    );
  };

  return (
    <ElementSettingsPane
      width={300}
      open={!!component}
      title={strings.layoutEditorV2.drawerTitle}
      actionIcon={<MenuIcon sx={{ color: "#2196F3" }} />}
      menuOptions={getPanelMenuOptions()}
    >
      <GenericComponentProperties
        component={component}
        pageLayout={layout}
        updateComponent={updateComponent}
        setPageLayout={setLayout}
      />
      {renderComponentSpecificProperties()}
      {renderVideoControlsChildProperties()}
    </ElementSettingsPane>
  );
};

export default LayoutRightPanel;
