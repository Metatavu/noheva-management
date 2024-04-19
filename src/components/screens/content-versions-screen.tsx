import {
  CircularProgress,
  Typography
} from "@mui/material";
import { WithStyles } from "@mui/styles";
import withStyles from "@mui/styles/withStyles";
import { History } from "history";
import produce from "immer";
import { KeycloakInstance } from "keycloak-js";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import Api from "../../api/api";
import {
  Exhibition,
  ExhibitionDeviceGroup,
  ExhibitionPage,
  ExhibitionRoom,
  VisitorVariable
} from "../../generated/client";
import { ContentVersion } from "../../generated/client/models/ContentVersion";
import strings from "../../localization/strings";
import { ReduxActions, ReduxState } from "../../store";
import styles from "../../styles/exhibition-view";
import {
  AccessToken,
  ActionButton,
  BreadcrumbData,
  ConfirmDialogData,
  DeleteDataHolder,
  LanguageOptions,
  MultiLingualContentVersion
} from "../../types";
import DeleteUtils from "../../utils/delete-utils";
import CardItem from "../generic/card/card-item";
import CardList from "../generic/card/card-list";
import ConfirmDialog from "../generic/confirm-dialog";
import BasicLayout from "../layouts/basic-layout";
import ContentVersionEditDialog from "../content-versions/content-version-edit-dialog";

/**
 * Component props
 */
interface Props extends WithStyles<typeof styles> {
  history: History;
  keycloak: KeycloakInstance;
  accessToken: AccessToken;
  exhibitionId: string;
  roomId: string;
}

/**
 * Component state
 */
interface State {
  loading: boolean;
  error?: Error;
  exhibition?: Exhibition;
  room?: ExhibitionRoom;
  contentVersions: ContentVersion[];
  deviceGroups: ExhibitionDeviceGroup[];
  multiLingualContentVersions: MultiLingualContentVersion[];
  dialogOpen: boolean;
  deleteDialogOpen: boolean;
  addNewContentVersion: boolean;
  visitorVariables?: VisitorVariable[];
  confirmDialogData: ConfirmDialogData;
  selectedContentVersion?: ContentVersion;
}

/**
 * Component for content version view
 */
class ContentVersionsScreen extends React.Component<Props, State> {
  /**
   * Constructor
   *
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      loading: false,
      multiLingualContentVersions: [],
      contentVersions: [],
      deviceGroups: [],
      dialogOpen: false,
      deleteDialogOpen: false,
      addNewContentVersion: false,
      confirmDialogData: {
        title: strings.contentVersion.delete.deleteTitle,
        text: strings.contentVersion.delete.deleteText,
        cancelButtonText: strings.confirmDialog.cancel,
        positiveButtonText: strings.confirmDialog.delete,
        deletePossible: true,
        onCancel: this.onCloseOrCancelClick,
        onClose: this.onCloseOrCancelClick
      }
    };
  }

  /**
   * Component did mount life cycle handler
   */
  public componentDidMount = async () => {
    this.setState({ loading: true });
    await this.fetchData();
    this.setState({ loading: false });
  };

  /**
   * Component render method
   */
  public render = () => {
    const { classes, history, keycloak } = this.props;
    const { room, error } = this.state;
    const actionBarButtons = this.getActionButtons();
    const breadcrumbs = this.getBreadcrumbsData();

    if (this.state.loading) {
      return (
        <BasicLayout
          keycloak={keycloak}
          history={history}
          title={""}
          breadcrumbs={breadcrumbs}
          actionBarButtons={actionBarButtons}
          error={error}
          clearError={() => this.setState({ error: undefined })}
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
        title={room?.name || ""}
        breadcrumbs={breadcrumbs}
        actionBarButtons={actionBarButtons}
      >
        {this.renderContentVersionCardsList()}
        {this.renderAddDialog()}
        {this.renderConfirmDeleteDialog()}
      </BasicLayout>
    );
  };

  /**
   * Renders content versions as card list
   */
  private renderContentVersionCardsList = () => {
    const { multiLingualContentVersions, exhibition, room, selectedContentVersion, deviceGroups } =
      this.state;

    if (!exhibition) {
      return null;
    }

    const cards = multiLingualContentVersions.map((multiLingualContentVersion) => {
      const deviceGroupName =
        deviceGroups.find(
          (group) => group.id === multiLingualContentVersion.languageVersions[0].deviceGroupId
        )?.name || "";

      const languageVersions = this.sortLanguageVersions(
        multiLingualContentVersion.languageVersions
      );
      const primaryVersion =
        languageVersions.find(
          (languageVersion) => languageVersion.language === LanguageOptions.FI
        ) ?? languageVersions[0];

      const languages = (
        <Typography variant="body1">
          {languageVersions.map((languageVersion) => languageVersion.language).join(" / ")}
        </Typography>
      );

      const defaultLocale = (multiLingualContentVersion.languageVersions.filter(
        (lang) => lang.language === LanguageOptions.FI
      ) || multiLingualContentVersion.languageVersions[0])[0];

      return (
        <CardItem
          key={primaryVersion.id}
          title={primaryVersion.name}
          subtitle={room?.name}
          context={
            <div>
              <div>
                <Typography variant="body1">{deviceGroupName}</Typography>
                {languages}
              </div>
            </div>
          }
          onClick={() => this.onCardClick(multiLingualContentVersion.languageVersions[0])}
          menuOptions={this.getCardMenuOptions(multiLingualContentVersion)}
          selected={
            selectedContentVersion?.id === multiLingualContentVersion.languageVersions[0].id
          }
          onActionClick={() => this.openTimeline(defaultLocale)}
        />
      );
    });

    return <CardList title={strings.contentVersion.contentMaterials}>{cards}</CardList>;
  };

  /**
   * Returns selected multilingual content version
   * 
   * @returns selected multilingual content version
   */
  private getSelectedMultiLingualContentVersion = () => {
    const { selectedContentVersion, multiLingualContentVersions } = this.state;

    if (!selectedContentVersion) {
      return null;
    }

    return multiLingualContentVersions.find(multiLingualContentVersion => multiLingualContentVersion.languageVersions[0].id === selectedContentVersion.id);
  };

  /**
   * Render add dialog
   */
  private renderAddDialog = () => {
    const { deviceGroups, multiLingualContentVersions } = this.state;

    let selectedMultiLingualContentVersion = this.getSelectedMultiLingualContentVersion();
    if (this.state.addNewContentVersion) {
      selectedMultiLingualContentVersion = {
        languageVersions: [{
          name: "",
          language: LanguageOptions.FI,
          rooms: [
            this.props.roomId
          ]
        }]
      }
    }

    if (!selectedMultiLingualContentVersion) {
      return null;
    }
    
    return (
      <ContentVersionEditDialog 
        multiLingualContentVersion={ selectedMultiLingualContentVersion }
        visitorVariables={ this.state.visitorVariables }
        deviceGroups={ deviceGroups }
        dialogOpen={ this.state.dialogOpen }
        classes={ this.props.classes }
        isExistingName={ (name) => this.isExistingName(name, multiLingualContentVersions) }
        onSaveClick={ this.onDialogSaveClick }
        onCloseClick={ this.onCloseOrCancelClick }
      />
    );
  };

  /**
   * Render content version confirmation dialog
   */
  private renderConfirmDeleteDialog = () => {
    const { selectedContentVersion, deleteDialogOpen, confirmDialogData } = this.state;

    if (selectedContentVersion) {
      return <ConfirmDialog open={deleteDialogOpen} confirmDialogData={confirmDialogData} />;
    }
  };

  /**
   * Gets action buttons
   *
   * @returns action buttons as array
   */
  private getActionButtons = () => {
    return [
      { name: strings.contentVersion.add, action: this.onAddMultiLingualContentVersionClick }
    ] as ActionButton[];
  };

  /**
   * Fetches component data
   */
  private fetchData = async () => {
    const { accessToken, exhibitionId, roomId, history } = this.props;

    const exhibitionsApi = Api.getExhibitionsApi(accessToken);
    const exhibitionRoomsApi = Api.getExhibitionRoomsApi(accessToken);
    const contentVersionsApi = Api.getContentVersionsApi(accessToken);
    const visitorVariablesApi = Api.getVisitorVariablesApi(accessToken);
    const deviceGroupsApi = Api.getExhibitionDeviceGroupsApi(accessToken);

    const [ exhibition, room, contentVersions, visitorVariables, deviceGroups ] = await Promise.all([
      exhibitionsApi.findExhibition({ exhibitionId }),
      exhibitionRoomsApi.findExhibitionRoom({ exhibitionId: exhibitionId, roomId: roomId }),
      contentVersionsApi.listContentVersions({ exhibitionId, roomId }),
      visitorVariablesApi.listVisitorVariables({ exhibitionId: exhibitionId }),
      deviceGroupsApi.listExhibitionDeviceGroups({ exhibitionId: exhibitionId, roomId: roomId })
    ]);

    /**
     * Content versions are linked together if they have the same name but different language.
     * It is for now the only way to recognize different languages of the same content.
     * That's why when creating new content versions and modifying existing ones,
     * the user should be prohibited to make two content versions with the same name and language.
     */
    const multiLingualContentVersions: MultiLingualContentVersion[] = [];
    contentVersions
      .sort((a, b) => a.name.localeCompare(b.name, "fi"))
      .forEach((contentVersion) => {
        const existingIndex = multiLingualContentVersions.findIndex(
          (multiLingualContentVersion) => {
            const { languageVersions } = multiLingualContentVersion;
            const sameName = languageVersions.some(
              (languageVersion) => languageVersion.name === contentVersion.name
            );
            const differentLanguage = languageVersions.every(
              (languageVersion) => languageVersion.language !== contentVersion.language
            );
            return sameName && differentLanguage;
          }
        );

        if (existingIndex > -1) {
          multiLingualContentVersions[existingIndex].languageVersions.push(contentVersion);
          return;
        }

        multiLingualContentVersions.push({ languageVersions: [contentVersion] });
      });
      
    const queryParams = history.location.search ? new URLSearchParams(history.location.search) : null;
    const preselectedContentVersionId = queryParams?.get("contentVersionId");
    const preselectedContentVersion = preselectedContentVersionId ? multiLingualContentVersions.find(multiLingualContentVersion => multiLingualContentVersion.languageVersions[0].id === preselectedContentVersionId)?.languageVersions[0] : undefined;

    this.setState({
      exhibition,
      room,
      multiLingualContentVersions,
      visitorVariables,
      contentVersions,
      deviceGroups,
      selectedContentVersion: preselectedContentVersion
    });
  };

  /**
   * Get card menu options
   *
   * @param multiLingualContentVersion multilingual content version
   * @returns card menu options as action button array
   */
  private getCardMenuOptions = (
    multiLingualContentVersion: MultiLingualContentVersion
  ): ActionButton[] => {
    return [
      {
        name: strings.exhibitions.cardMenu.delete,
        action: () => this.onDeleteClick(multiLingualContentVersion)
      },
      {
        name: strings.exhibitions.cardMenu.edit,
        action: () => this.editMultiLingualContentVersion(multiLingualContentVersion)
      }
    ];
  };

  /**
   * Deletes multilingual content version
   *
   * @param multiLingualContentVersion multilingual content version to delete
   */
  private deleteMultiLingualContentVersion = async (
    multiLingualContentVersion: MultiLingualContentVersion
  ) => {
    const { accessToken, exhibitionId } = this.props;
    const { languageVersions } = multiLingualContentVersion;

    if (languageVersions.some((languageVersion) => !languageVersion.id)) {
      return;
    }

    const contentVersionApi = Api.getContentVersionsApi(accessToken);
    try {
      await Promise.all(
        languageVersions.map((languageVersion) =>
          contentVersionApi.deleteContentVersion({
            exhibitionId: exhibitionId,
            contentVersionId: languageVersion.id!
          })
        )
      );
    } catch (error: any) {
      this.setState({ error: new Error(error) });
      return;
    }

    this.setState(
      produce((draft: State) => {
        const foundIndex = this.findMultiLingualContentVersionIndex(
          multiLingualContentVersion,
          draft.multiLingualContentVersions
        );

        if (foundIndex > -1) {
          draft.multiLingualContentVersions.splice(foundIndex, 1);
        }

        draft.deleteDialogOpen = false;
      })
    );
  };

  /**
   * Event handler for card delete click
   *
   * @param multiLingualContentVersion clicked multi lingual content version
   */
  private onDeleteClick = async (multiLingualContentVersion: MultiLingualContentVersion) => {
    const { accessToken, exhibitionId } = this.props;
    const { confirmDialogData } = this.state;

    const pagesApi = Api.getExhibitionPagesApi(accessToken);

    const tempDeleteData = { ...confirmDialogData } as ConfirmDialogData;
    const allPages: ExhibitionPage[] = [];

    for (const contentVersion of multiLingualContentVersion.languageVersions) {
      const pages = await pagesApi.listExhibitionPages({
          exhibitionId: exhibitionId,
          contentVersionId: contentVersion.id
      });

      allPages.push(...pages);
    }

    if (allPages.length > 0) {
      // TODO: causing a read only error if try to delete straight after creating a new content version
      tempDeleteData.deletePossible = false;
      tempDeleteData.contentTitle = strings.contentVersion.delete.contentTitle;

      const holder: DeleteDataHolder[] = [];
      holder.push({ objects: allPages, localizedMessage: strings.deleteContent.pages });
      tempDeleteData.contentSpecificMessages = DeleteUtils.constructContentDeleteMessages(holder);
    } else {
      tempDeleteData.deletePossible = true;
      tempDeleteData.contentSpecificMessages = [];
    }

    tempDeleteData.onConfirm = () => this.deleteMultiLingualContentVersion(multiLingualContentVersion);

    this.setState({
      deleteDialogOpen: true,
      selectedContentVersion: multiLingualContentVersion.languageVersions[0],
      confirmDialogData: tempDeleteData
    });
  };

  /**
   * Edit multilingual content version
   *
   * @param multiLingualContentVersion multilingual content version to edit
   */
  private editMultiLingualContentVersion = (
    multiLingualContentVersion: MultiLingualContentVersion
  ) => {
    this.setState({
      dialogOpen: true,
      selectedContentVersion: multiLingualContentVersion.languageVersions[0],
      addNewContentVersion: false
    });
  };

  /**
   * Get breadcrumbs data
   *
   * @returns breadcrumbs data as array
   */
  private getBreadcrumbsData = () => {
    const { exhibitionId } = this.props;
    const { exhibition, room } = this.state;
    return [
      { name: strings.exhibitions.listTitle, url: "/exhibitions" },
      { name: exhibition?.name, url: `/exhibitions/${exhibitionId}/content` },
      { name: room?.name || "" }
    ] as BreadcrumbData[];
  };

  /**
   * Event handler for card click
   *
   * @param contentVersionId content version id
   */
  private onCardClick = (contentVersion: ContentVersion) => {
    this.setState({
      selectedContentVersion: contentVersion
    });
  };

  /**
   * Opens timeline screen
   *
   * @param contentVersion selected content version
   */
  private openTimeline = (contentVersion: ContentVersion) => {
    const { history } = this.props;
    history.push(`${history.location.pathname}/contentVersions/${contentVersion.id}/timeline`);
  };

  /**
   * On dialog save click handler
   */
  private onDialogSaveClick = async (changedMultiLingualContentVersion: MultiLingualContentVersion) => {
    const { accessToken, exhibitionId } = this.props;
    const { addNewContentVersion } = this.state;
    const contentVersionApi = Api.getContentVersionsApi(accessToken);
    
    const newState = await produce(this.state, async (draft) => {
      if (addNewContentVersion) {

        const newContentVersion = await contentVersionApi.createContentVersion({
          exhibitionId: exhibitionId,
          contentVersion: changedMultiLingualContentVersion.languageVersions[0]
        });

        const newMultiLingualContentVersion = {
          languageVersions: [newContentVersion]
        };

        draft.multiLingualContentVersions.push(newMultiLingualContentVersion);
        draft.contentVersions.push(newContentVersion);
      } else {
        const { languageVersions } = changedMultiLingualContentVersion;
        const updatedLanguageVersions = await Promise.all(
          languageVersions.map((languageVersion) =>
            contentVersionApi.updateContentVersion({
              contentVersionId: languageVersion.id!,
              exhibitionId: exhibitionId,
              contentVersion: languageVersion
            })
          )
        );

        const updatedMultiLingualContentVersion: MultiLingualContentVersion = {
          languageVersions: updatedLanguageVersions
        };

        const versionIndex = this.findMultiLingualContentVersionIndex(
          updatedMultiLingualContentVersion,
          draft.multiLingualContentVersions
        );

        if (versionIndex > -1) {
          draft.multiLingualContentVersions.splice(
            versionIndex,
            1,
            updatedMultiLingualContentVersion
          );
          draft.contentVersions.splice(versionIndex, 1, updatedLanguageVersions[0]);
        }
      }

      draft.dialogOpen = false;
    });

    this.setState(newState);
  };

  /**
   * On add multilingual content version click
   */
  private onAddMultiLingualContentVersionClick = () => {
    const { roomId } = this.props;
    const selectedMultiLingualContentVersion: MultiLingualContentVersion = {
      languageVersions: [
        {
          name: "",
          language: LanguageOptions.FI,
          rooms: [roomId]
        }
      ]
    };

    this.setState({
      dialogOpen: true,
      selectedContentVersion: selectedMultiLingualContentVersion.languageVersions[0],
      addNewContentVersion: true
    });
  };

  /**
   * On dialog close or cancel click handler
   */
  private onCloseOrCancelClick = () => {
    this.setState({
      dialogOpen: false,
      deleteDialogOpen: false,
      selectedContentVersion: undefined
    });
  };

  /**
   * Returns index of matching multilingual content version from given list if found
   *
   * @param multiLingualContentVersion multilingual content version to find
   * @param multiLingualContentVersionList list of multilingual content versions to search from
   * @return index of multilingual content version if found, otherwise -1
   */
  private findMultiLingualContentVersionIndex = (
    multiLingualContentVersion: MultiLingualContentVersion,
    multiLingualContentVersionList: MultiLingualContentVersion[]
  ) => {
    return multiLingualContentVersionList.findIndex((versionInList) =>
      versionInList.languageVersions.every(
        (languageVersion, index) =>
          languageVersion.id === multiLingualContentVersion.languageVersions[index].id
      )
    );
  };

  /**
   * Sorts language versions
   *
   * @param languageVersions language versions
   */
  private sortLanguageVersions = (languageVersions: ContentVersion[]) => {
    const sortedList: ContentVersion[] = [];

    [LanguageOptions.FI, LanguageOptions.EN, LanguageOptions.SV, LanguageOptions.RU].forEach(
      (languageOption) => {
        const foundLanguage = languageVersions.find(
          (version) => version.language === languageOption
        );
        foundLanguage && sortedList.push(foundLanguage);
      }
    );

    return sortedList;
  };

  /**
   * Returns whether given name already exists in other content versions
   *
   * @param name name as string
   * @param multiLingualContentVersions list of multilingual content versions
   */
  private isExistingName = (
    name: string,
    multiLingualContentVersions: MultiLingualContentVersion[]
  ) => {
    return multiLingualContentVersions.some(
      (multiLingualContentVersion) => multiLingualContentVersion.languageVersions[0].name === name
    );
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
    accessToken: state.auth.accessToken as AccessToken
  };
}

/**
 * Redux mapper for mapping component dispatches
 *
 * @param dispatch dispatch method
 */
function mapDispatchToProps(dispatch: Dispatch<ReduxActions>) {
  return {};
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(ContentVersionsScreen) as any) as any;
