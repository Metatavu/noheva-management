import { setLayouts, setSelectedLayout } from "../../actions/layouts";
import { setSelectedSubLayout, setSubLayouts } from "../../actions/subLayouts";
import Api from "../../api/api";
import {
  DeviceModel,
  Exhibition,
  ExhibitionPage,
  ExhibitionPageResource,
  ExhibitionPageResourceType,
  LayoutType,
  PageLayout,
  PageLayoutViewHtml,
  PageLayoutWidgetType,
  PageLayoutViewPropertyType,
  PageResourceMode,
  ScreenOrientation,
  SubLayout
} from "../../generated/client";
import strings from "../../localization/strings";
import { ReduxActions, ReduxState } from "../../store";
import styles from "../../styles/exhibition-view";
import {
  AccessToken,
  ActionButton,
  ConfirmDialogData,
  DeleteDataHolder,
  HtmlComponentType,
  TreeObject
} from "../../types";
import DeleteUtils from "../../utils/delete-utils";
import HtmlComponentsUtils from "../../utils/html-components-utils";
import HtmlResourceUtils from "../../utils/html-resource-utils";
import AddNewLayoutDialog from "../dialogs/add-new-layout-dialog";
import CardItem from "../generic/card/card-item";
import CardList from "../generic/card/card-list";
import ConfirmDialog from "../generic/confirm-dialog";
import { constructTree } from "../layout/utils/tree-html-data-utils";
import CardBadge from "../layout/v2/card-badge";
import BasicLayout from "../layouts/basic-layout";
import { Android as AndroidIcon, Html as HtmlIcon } from "@mui/icons-material/";
import { CircularProgress } from "@mui/material";
import { WithStyles } from "@mui/styles";
import withStyles from "@mui/styles/withStyles";
import produce from "immer";
import { KeycloakInstance } from "keycloak-js";
import { Component } from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { v4 as uuid } from "uuid";

/**
 * Component props
 */
interface Props extends WithStyles<typeof styles> {
  history: History;
  keycloak: KeycloakInstance;
  accessToken: AccessToken;
  layouts: PageLayout[];
  deviceModels: DeviceModel[];
  setLayouts: typeof setLayouts;
  setSelectedLayout: typeof setSelectedLayout;
  setSubLayouts: typeof setSubLayouts;
  setSelectedSubLayout: typeof setSelectedSubLayout;
}

/**
 * Component state
 */
interface State {
  loading: boolean;
  addNewDialogOpen: boolean;
  newLayout: Partial<PageLayout>;
  newSubLayout: Partial<SubLayout>;
  createSubLayout: boolean;
  deleteDialogOpen: boolean;
  confirmDialogData: ConfirmDialogData;
}

/**
 * Component for layouts screen
 */
class LayoutsScreen extends Component<Props, State> {
  /**
   * Constructor
   *
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      loading: false,
      addNewDialogOpen: false,
      newLayout: {},
      newSubLayout: {},
      createSubLayout: false,
      deleteDialogOpen: false,
      confirmDialogData: this.defaultDeleteData
    };
  }

  /**
   * Event handler for clear dialog
   */
  private clearDialog = () => {
    this.setState({
      deleteDialogOpen: false,
      confirmDialogData: this.defaultDeleteData
    });
  };

  /**
   * Default values for delete dialog
   */
  private defaultDeleteData: ConfirmDialogData = {
    title: strings.layout.delete.deleteTitle,
    text: strings.layout.delete.deleteText,
    cancelButtonText: strings.confirmDialog.cancel,
    positiveButtonText: strings.confirmDialog.delete,
    deletePossible: true,
    onCancel: this.clearDialog,
    onClose: this.clearDialog
  };

  /**
   * Component render method
   */
  public render = () => {
    const { classes, history, keycloak } = this.props;

    if (this.state.loading) {
      return (
        <BasicLayout
          keycloak={keycloak}
          history={history}
          title={strings.layout.title}
          breadcrumbs={[]}
          actionBarButtons={[]}
          noBackButton
        >
          <div className={classes.loader}>
            <CircularProgress size={50} color="secondary" />
          </div>
        </BasicLayout>
      );
    }

    return (
      <BasicLayout
        keycloak={keycloak}
        history={history}
        title={strings.layout.title}
        breadcrumbs={[]}
        actionBarButtons={this.getActionButtons()}
        noBackButton
      >
        {this.renderLayoutCardsList()}
        <AddNewLayoutDialog
          open={this.state.addNewDialogOpen}
          deviceModels={this.props.deviceModels}
          onClose={this.toggleAddNewDialog}
          onCreateNewLayout={this.createNewLayout}
        />
        {this.renderConfirmDialog()}
      </BasicLayout>
    );
  };

  /**
   * Gets appropriate badge content for layout card
   *
   * @param layout layout
   * @returns appropriate icon for layout card
   */
  private getLayoutBadgeContent = (layout: PageLayout) => {
    switch (layout.layoutType) {
      case LayoutType.Html:
        return <HtmlIcon />;
      case LayoutType.Android:
        return <AndroidIcon />;
    }
  };

  /**
   * Renders layouts as card list
   */
  private renderLayoutCardsList = () => {
    const { layouts } = this.props;
    if (!layouts.length) {
      return null;
    }

    const layoutCards = [...layouts]
      .sort((a, _) => (a.layoutType === LayoutType.Html ? -1 : 1))
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((layout) => {
        const layoutId = layout.id;
        if (!layoutId || !layout.layoutType) {
          return null;
        }

        const cardMenuOptions = this.getLayoutCardMenuOptions(layout);

        return (
          <CardBadge key={layout.id} badgeContent={this.getLayoutBadgeContent(layout)}>
            <CardItem
              title={layout.name}
              onClick={() => this.onLayoutCardClick(layoutId, layout.layoutType)}
              menuOptions={cardMenuOptions}
            />
          </CardBadge>
        );
      });

    return (
      <div style={{ width: "100%", overflowY: "auto" }}>
        <CardList autoHeight>{layoutCards}</CardList>
      </div>
    );
  };

  /**
   * Renders confirmation dialog
   */
  private renderConfirmDialog = () => {
    const { deleteDialogOpen, confirmDialogData } = this.state;

    return <ConfirmDialog open={deleteDialogOpen} confirmDialogData={confirmDialogData} />;
  };

  /**
   * Gets layout card menu options
   *
   * @param layout page layout
   * @returns layout card menu options as action button array
   */
  private getLayoutCardMenuOptions = (pageLayout: PageLayout): ActionButton[] => {
    return [
      {
        name: strings.exhibitions.cardMenu.delete,
        action: () => this.onDeletePageLayoutClick(pageLayout)
      },
      {
        name: strings.generic.doCopy,
        action: () => this.onCopyPageLayoutClick(pageLayout)
      }
    ];
  };

  /**
   * Gets action buttons
   *
   * @returns action buttons as array
   */
  private getActionButtons = () => {
    return [{ name: strings.layout.addNew, action: this.toggleAddNewDialog }] as ActionButton[];
  };

  private processTreeBranch = (branch: TreeObject, elementIdsMap: { [key: string]: string }) => {
    elementIdsMap[branch.id] = uuid();
    for (const child of branch.children) {
      this.processTreeBranch(child, elementIdsMap);
    }
  };

  /**
   * Event handler for page layout copy click
   *
   * @param pageLayout page layout to copy
   */
  private onCopyPageLayoutClick = async (pageLayout: PageLayout) => {
    const { accessToken } = this.props;

    if (!pageLayout.id || pageLayout.layoutType !== LayoutType.Html) return;

    let layoutCopy = { ...pageLayout };

    const elementIdsMap: { [key: string]: string } = {};
    const defaultResourcesMap: { [id: string]: ExhibitionPageResource } = {};
    const defaultResources = layoutCopy.defaultResources || [];
    for (const resource of defaultResources) {
      defaultResourcesMap[resource.id] = { ...resource, id: uuid() };
    }

    const tree = constructTree((layoutCopy.data as PageLayoutViewHtml).html);
    this.processTreeBranch(tree[0], elementIdsMap);
    let layoutCopyHtml = (layoutCopy.data as PageLayoutViewHtml).html;
    Object.keys(elementIdsMap).forEach((key) => {
      layoutCopyHtml = layoutCopyHtml.replace(key, elementIdsMap[key]);
    });
    Object.keys(defaultResourcesMap).forEach((key) => {
      layoutCopyHtml = layoutCopyHtml.replace(key, defaultResourcesMap[key].id);
    });

    layoutCopy = {
      ...layoutCopy,
      name: `${layoutCopy.name} - ${strings.generic.copy}`,
      defaultResources: Object.values(defaultResourcesMap),
      data: {
        html: layoutCopyHtml
      }
    };
    const layoutsApi = Api.getPageLayoutsApi(accessToken);
    const createdLayout = await layoutsApi.createPageLayout({ pageLayout: layoutCopy });
    this.props.setLayouts([...this.props.layouts, createdLayout]);
  };

  /**
   * Event handler for page layout delete click
   *
   * @param pageLayout page layout to delete
   */
  private onDeletePageLayoutClick = async (pageLayout: PageLayout) => {
    const { accessToken } = this.props;

    if (!pageLayout.id) {
      return;
    }

    const exhibitionsApi = Api.getExhibitionsApi(accessToken);
    const pagesApi = Api.getExhibitionPagesApi(accessToken);

    const allExhibitions = await exhibitionsApi.listExhibitions();

    const pages: ExhibitionPage[] = [];
    const exhibitions: Exhibition[] = [];

    for (const exhibition of allExhibitions) {
      const exhibitionPages = await pagesApi.listExhibitionPages({
        exhibitionId: exhibition.id!,
        pageLayoutId: pageLayout.id
      });

      if (exhibitionPages.length > 0) {
        pages.push(...exhibitionPages);
        exhibitions.push(exhibition);
      }
    }

    const tempDeleteData = { ...this.state.confirmDialogData } as ConfirmDialogData;
    tempDeleteData.title = strings.layout.delete.deleteTitle;
    tempDeleteData.text = strings.layout.delete.deleteText;
    tempDeleteData.onConfirm = () => this.deleteLayout(pageLayout);

    if (pages.length > 0) {
      tempDeleteData.deletePossible = false;
      tempDeleteData.contentTitle = strings.layout.delete.contentTitle;

      const holder: DeleteDataHolder[] = [];

      holder.push({ objects: pages, localizedMessage: strings.deleteContent.pages });
      holder.push({ objects: exhibitions, localizedMessage: strings.deleteContent.exhibitions });
      tempDeleteData.contentSpecificMessages = DeleteUtils.constructContentDeleteMessages(holder);
    }

    this.setState({
      deleteDialogOpen: true,
      confirmDialogData: tempDeleteData
    });
  };

  /**
   * Creates new layout
   *
   * @param name name
   * @param deviceModelId deviceModelId
   * @param layoutType layoutType
   */
  private createNewLayout = async (name: string, deviceModelId: string, layoutType: LayoutType) => {
    const { accessToken, setLayouts, layouts } = this.props;

    if (!name || !deviceModelId) {
      return;
    }

    let data = null;
    let defaultStyleResources: ExhibitionPageResource[] = [];
    
    if (layoutType == LayoutType.Html){
      const layoutHtml = HtmlComponentsUtils.getSerializedHtmlElement(HtmlComponentType.LAYOUT);
      const tempElement = document.createElement("div");
      tempElement.innerHTML = layoutHtml??"";
      defaultStyleResources = HtmlResourceUtils.getDefaultStyleResourcesForElement(
        tempElement.firstChild as HTMLElement
      );
      data = {
        html: layoutHtml
      }
    } else {
      data = { 
        id: uuid(),
        name: "",
        widget: PageLayoutWidgetType.FrameLayout,
        properties: [{
          name: "layout_width",
          value: "match_parent",
          type: PageLayoutViewPropertyType.String
        }, {
          name: "layout_height",
          value: "match_parent",
          type: PageLayoutViewPropertyType.String
        }, {
          name: "background",
          value: "#000000",
          type: PageLayoutViewPropertyType.String
        }],
        children: []
      }
    };

    const pageLayout: PageLayout = {
      name: name,
      screenOrientation: ScreenOrientation.Landscape,
      modelId: deviceModelId,
      layoutType: layoutType,
      data: data,
      defaultResources: defaultStyleResources
    };
    const layoutsApi = Api.getPageLayoutsApi(accessToken);
    const createdLayout = await layoutsApi.createPageLayout({ pageLayout });
    setLayouts([...layouts, createdLayout]);
    this.setState({
      addNewDialogOpen: false
    });
  };

  /**
   * Event handler for layout card click
   *
   * @param layoutId layout id
   */
  private onLayoutCardClick = (layoutId: string, layoutType: LayoutType) => {
    const { layouts } = this.props;
    const { pathname } = this.props.history.location;
    const foundLayout = layouts.find((layout) => layout.id === layoutId);

    if (!foundLayout) {
      return;
    }

    this.props.setSelectedLayout(foundLayout);
    this.props.history.push(`${pathname}/${layoutType}/${layoutId}`);
  };

  /**
   * Toggles add new layout dialog
   */
  private toggleAddNewDialog = () => {
    this.setState({
      addNewDialogOpen: !this.state.addNewDialogOpen
    });
  };

  /**
   * Deletes layout
   *
   * @param layout layout
   */
  private deleteLayout = async (pageLayout: PageLayout) => {
    const { accessToken, layouts } = this.props;
    const pageLayoutId = pageLayout.id;

    if (!pageLayoutId) {
      return;
    }

    const layoutsApi = Api.getPageLayoutsApi(accessToken);
    await layoutsApi.deletePageLayout({ pageLayoutId });

    const updatedLayouts = produce(layouts, (draft) => {
      const layoutIndex = draft.findIndex((layout) => layout.id === pageLayoutId);
      if (layoutIndex > -1) {
        draft.splice(layoutIndex, 1);
      }
    });

    this.clearDialog();
    this.props.setLayouts(updatedLayouts);
  };
}

/**
 * Redux mapper for mapping store state to component props
 *
 * @param state store state
 */
function mapStateToProps(state: ReduxState) {
  return {
    keycloak: state.auth.keycloak as KeycloakInstance,
    accessToken: state.auth.accessToken as AccessToken,
    layouts: state.layouts.layouts,
    deviceModels: state.devices.deviceModels
  };
}

/**
 * Redux mapper for mapping component dispatches
 *
 * @param dispatch dispatch method
 */
function mapDispatchToProps(dispatch: Dispatch<ReduxActions>) {
  return {
    setLayouts: (layouts: PageLayout[]) => dispatch(setLayouts(layouts)),
    setSelectedLayout: (layout: PageLayout) => dispatch(setSelectedLayout(layout)),
    setSelectedSubLayout: (subLayout: SubLayout) => dispatch(setSelectedSubLayout(subLayout))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(LayoutsScreen));
