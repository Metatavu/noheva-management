import * as React from "react";

import { connect } from "react-redux";
import { Dispatch } from "redux";
import { ReduxActions, ReduxState } from "../../store";
import { setSelectedExhibition } from "../../actions/exhibitions";
import Api from "../../api/api";

import { History } from "history";
import styles from "../../styles/exhibition-view-v3";
// eslint-disable-next-line max-len
import { WithStyles, withStyles, CircularProgress, ButtonGroup, Button, Typography, MenuItem, Select, TextField, FilledInput, InputAdornment, List, ListItem, Input, Grid, InputLabel } from "@material-ui/core";
import { TreeView, TreeItem } from "@material-ui/lab";
import { KeycloakInstance } from "keycloak-js";
// eslint-disable-next-line max-len
import { Exhibition, ExhibitionPage, PageLayout, DeviceModel, ExhibitionPageEventTrigger, ExhibitionPageResource, ExhibitionPageEventTriggerFromJSON, ExhibitionPageEventActionType, ExhibitionPageResourceFromJSON, PageLayoutView, ExhibitionPageResourceType, ExhibitionDevice, ExhibitionContentVersion, ExhibitionFloor, ExhibitionRoom, ScreenOrientation, ExhibitionDeviceGroup } from "../../generated/client";
import EventTriggerEditor from "../right-panel-editors/event-trigger-editor";
import BasicLayout from "../generic/basic-layout";
import ElementSettingsPane from "../editor-panes/element-settings-pane";
import ElementNavigationPane from "../editor-panes/element-navigation-pane";
import EditorView from "../editor/editor-view";
import { AccessToken, JsonLintParseErrorHash, ExhibitionElementType, ExhibitionElement } from '../../types';
import strings from "../../localization/strings";
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import AddIcon from "@material-ui/icons/AddSharp";
import AndroidUtils from "../../utils/android-utils";
import PagePreview from "../preview/page-preview";
import { Controlled as CodeMirror } from "react-codemirror2";
import * as codemirror from "codemirror";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/material.css";
import "codemirror/mode/javascript/javascript"
import "codemirror/addon/lint/lint.css";
import 'codemirror/addon/lint/lint';
import * as jsonlint from "jsonlint-mod";
import slugify from "slugify";
import SearchIcon from '@material-ui/icons/Search';
import TreeMenu, { TreeMenuItem } from "react-simple-tree-menu";
import { TreeNodeInArray } from "react-simple-tree-menu";
import theme from "../../styles/theme";

type View = "CODE" | "VISUAL";

/**
 * Component props
 */
interface Props extends WithStyles<typeof styles> {
  history: History;
  keycloak: KeycloakInstance;
  accessToken: AccessToken;
  exhibitionId: string;
  exhibition: Exhibition;
  layouts: PageLayout[];
  devices: ExhibitionDevice[];
  deviceModels: DeviceModel[];
  setSelectedExhibition: typeof setSelectedExhibition;
}

/**
 * Component state
 */
interface State {
  error?: Error;
  loading: boolean;
  contentVersions: ExhibitionContentVersion[];
  floors: ExhibitionFloor[];
  rooms: ExhibitionRoom[];
  deviceGroups: ExhibitionDeviceGroup[];
  devices: ExhibitionDevice[];
  pages: ExhibitionPage[];
  treeData?: TreeNodeInArray[];
  selectedElement?: ExhibitionContentVersion | ExhibitionFloor | ExhibitionDevice | ExhibitionPage;
  pageLayout?: PageLayout;
  selectedRoomId?: string;
  selectedDeviceGroupId?: string;
  selectedResource?: ExhibitionPageResource;
  selectedEventTrigger?: ExhibitionPageEventTrigger;
  view: View;
  name: string;
  jsonCode: string;
  addDevice?: Partial<ExhibitionDevice>;
}

/**
 * Interface for tree data parameters
 */
interface TreeDataParams {
  exhibition: Exhibition;
  contentVersions: ExhibitionContentVersion[];
  floors: ExhibitionFloor[];
  rooms: ExhibitionRoom[];
  devices: ExhibitionDevice[];
  pages: ExhibitionPage[];
}

/**
 * Component for exhibition view
 */
export class ExhibitionView extends React.Component<Props, State> {

  /**
   * Constructor
   *
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      loading: false,
      contentVersions: [],
      floors: [],
      rooms: [],
      devices: [],
      pages: [],
      deviceGroups: [],
      view: "VISUAL",
      name: "",
      jsonCode: "{}"
    };
  }

  /**
   * Component did mount life cycle handler
   */
  public componentDidMount = async () => {
    const { exhibition, exhibitionId, accessToken } = this.props;

    if (!exhibition || exhibitionId !== exhibition.id) {
      const exhibitionsApi = Api.getExhibitionsApi(accessToken);
      this.props.setSelectedExhibition(await exhibitionsApi.findExhibition({ exhibitionId }));
      return;
    }

    this.fetchExhibitionData(this.props.exhibition);
  }

  /**
   * Component did update life cycle handler
   */
  public componentDidUpdate = (prevProps: Props) => {
    if (!prevProps.exhibition && this.props.exhibition) {
      this.fetchExhibitionData(this.props.exhibition);
    }
  }

  /**
   * Component render method
   */
  public render = () => {
    const { classes, exhibition } = this.props;
    const { selectedElement, treeData } = this.state;

    if (!exhibition || !exhibition.id || this.state.loading) {
      return (
        <CircularProgress></CircularProgress>
      );
    }

    return (
      <BasicLayout
        title={ exhibition.name }
        onDashboardButtonClick={() => this.onDashboardButtonClick() }
        keycloak={ this.props.keycloak }
        error={ this.state.error }
        clearError={ () => this.setState({ error: undefined }) }>

        <div className={ classes.editorLayout }>
          <ElementNavigationPane title="">
            <ButtonGroup className={ classes.navigationTabs }>
              <Button>{ strings.exhibition.content }</Button>
              <Button>{ strings.exhibition.tech }</Button>
            </ButtonGroup>
            <FilledInput
              className={ classes.searchBar }
              fullWidth
              endAdornment={
                <InputAdornment position="end">
                  <SearchIcon/>
                </InputAdornment>
              }
            />
            { treeData &&
              this.renderTreeMenu(treeData)
            }
            <Button variant="outlined" color="primary" onClick={ this.onAddPageClick } startIcon={ <AddIcon />  }>{ strings.exhibition.addPage }</Button>
            <Button variant="outlined" disabled={ !this.state.selectedDeviceGroupId } color="primary" onClick={ this.onAddDeviceClick } startIcon={ <AddIcon />  }>{ strings.exhibition.addDevice }</Button>
          </ElementNavigationPane>
          <EditorView>
            <div className={ classes.toolBar }>
              { this.renderToolbarContents() }
            </div>
            { this.renderEditor() }
          </EditorView>
          <ElementSettingsPane title={ selectedElement ? selectedElement.name : "" }>
            { this.state.selectedElement &&
              this.renderElementSettingsContent()
            }
            {
              this.state.selectedResource &&
              this.renderResourceEditor()
            }
            {
              this.state.selectedEventTrigger &&
              this.renderEventTriggerEditor()
            }
          </ElementSettingsPane>
        </div>

      </BasicLayout>
    );
  }

  /**
   * Renders toolbar contents
   */
  private renderToolbarContents = () => {
    if (this.state.addDevice) {
      return this.renderToolbarContentsAddDevice();
    }

    if (this.state.selectedElement) {
      return this.renderToolbarContentsPageEditor();
    }

    return null;
  }

  /**
   * Renders add device view toolbar contents
   */
  private renderToolbarContentsAddDevice = () => {
    return (
      <>
        <Button variant="contained" color="primary" onClick={ this.onAddDeviceSaveClick }> { strings.exhibition.addDeviceEditor.saveButton  } </Button>
      </>
    );
  }

  /**
   * Renders page editor toolbar contents
   */
  private renderToolbarContentsPageEditor = () => {
    return (
      <>
        <Button variant="contained" color="primary" onClick={ this.onSwitchViewClick } style={{ marginRight: 8 }}>
          { this.state.view === "CODE" ? strings.exhibitionLayouts.editView.switchToVisualButton : strings.exhibitionLayouts.editView.switchToCodeButton }
        </Button>
        <Button variant="contained" color="primary" onClick={ this.onSaveClick }> { strings.exhibitionLayouts.editView.saveButton } </Button>
      </>
    );
  }

  /**
   * Renders tree menu
   *
   * @param treeData tree data
   */
  private renderTreeMenu = (treeData: TreeNodeInArray[]) => {
    return (
      <TreeMenu
        data={ treeData }
        onClickItem={({ key, label, ...props }) => {
          this.onSelectElementFromTree(props.element, props.elementType);
        }}
      >
        {({ search, items }) => (
          <>
            <Input onChange={ e => search && search(e.target.value) } placeholder={ strings.exhibition.navigation.search }></Input>
            <List>
              { items.map(item => this.renderTreeMenuItem(item)) }
            </List>
          </>
        )}
      </TreeMenu>
    );
  }

  /**
   * Renders tree menu item
   *
   * @param item tree menu item
   */
  private renderTreeMenuItem = (item: TreeMenuItem) => {
    const toggleIcon = (on: boolean) => on ? <ExpandMoreIcon/> : <ChevronRightIcon/>;
    const { level, focused, hasNodes, toggleNode, isOpen, label } = item;

    return (
      <ListItem { ...item }
        style={{
          paddingLeft: level * 20,
          cursor: 'pointer',
          boxShadow: focused ? '0px 0px 5px 0px #222' : 'none',
          zIndex: focused ? 999 : 'unset',
          position: 'relative',
        }}
      >
        { hasNodes &&
          (
            <div
              style={{ display: 'inline-block' }}
              onClick={ e => {
                if (hasNodes && toggleNode) {
                  toggleNode();
                }
                e.stopPropagation();
              }}
            >
              { toggleIcon(isOpen) }
            </div>
          )
        }
        { label }
      </ListItem>
    );
  }

  /**
   * Renders editor
   */
  private renderEditor = () => {
    if (this.state.addDevice) {
      return this.renderAddDeviceEditor();
    }

    switch (this.state.view) {
      case "CODE":
        return this.renderCodeEditor();
      case "VISUAL":
        return this.renderVisualEditor();
      default:
        return null;
    }
  }

  /**
   * Renders add device editor
   */
  private renderAddDeviceEditor = () => {
    if (!this.state.addDevice) {
      return null;
    }

    const modelSelectItems = this.props.deviceModels.map((deviceModel) => {
      return <MenuItem value={ deviceModel.id }>{ `${deviceModel.manufacturer} ${deviceModel.model}` }</MenuItem>;
    });

    return (
      <>
        <Typography style={{ marginBottom: theme.spacing(2) }} variant="h6">{ strings.exhibition.addDeviceEditor.title }</Typography>
        <Grid container spacing={ 2 } style={{ marginBottom: theme.spacing(1) }}>
          <Grid item xs={ 4 }>
            <TextField fullWidth type="text" label={ strings.exhibition.addDeviceEditor.nameLabel } name="name" value={ this.state.addDevice.name || "" } onChange={ this.onAddDeviceNameChange } />
            
            <InputLabel id="model">{ strings.exhibition.addDeviceEditor.deviceModelLabel }</InputLabel>
            <Select labelId="model" value={ this.state.addDevice.modelId } onChange={ this.onAddDeviceModelChange } >
              { modelSelectItems }
            </Select>

            <InputLabel id="screenOrientation">{ strings.exhibition.addDeviceEditor.screenOrientationLabel }</InputLabel>
            <Select labelId="screenOrientation" value={ this.state.addDevice.screenOrientation } onChange={ this.onAddDeviceScreenOrientationChange } >
              <MenuItem value={ ScreenOrientation.Portrait }>{ strings.exhibition.addDeviceEditor.screenOrientationPortrait }</MenuItem>
              <MenuItem value={ ScreenOrientation.Landscape }>{ strings.exhibition.addDeviceEditor.screenOrientationLandscape }</MenuItem>
            </Select>
          </Grid>
        </Grid>
      </>
    );
  }

  /**
   * Renders visual editor
   */
  private renderVisualEditor = () => {
    const { classes } = this.props;
    const { selectedElement, pageLayout } = this.state;

    if (!selectedElement) {
      return;
    }

    const parsedCode = this.parseJsonCode();

    const resources = parsedCode.resources;

    const view = pageLayout?.data;
    // TODO: load from layout
    const displayMetrics = AndroidUtils.getDisplayMetrics(this.props.deviceModels[0]);
    const scale = 0.3;

    return (
      <div className={ classes.visualEditorContainer }>
        <PagePreview view={ view } resources={ resources } displayMetrics={ displayMetrics } scale={ scale }/>
      </div>
    );
  }

  /**
   * Renders code editor
   */
  private renderCodeEditor = () => {
    const { classes } = this.props;
    const jsonEditorOptions: codemirror.EditorConfiguration = {
      mode: { name: "javascript", json: true },
      theme: "material",
      lineNumbers: true,
      lint: {
        getAnnotations: this.jsonEditorGetAnnotations
      },
      gutters: [
        'CodeMirror-lint-markers',
      ]
    };

    return (
      <div className={ classes.codeEditorContainer }>
        <Typography style={{ margin: 8 }}>{ strings.exhibitionLayouts.editView.json }</Typography>
        <CodeMirror
          className={ classes.editor }
          value={ this.state.jsonCode }
          options={ jsonEditorOptions }
          onBeforeChange={ this.onBeforeJsonCodeChange } />
      </div>
    );
  }

  /**
   * Renders element settings pane content
   */
  private renderElementSettingsContent = () => {
    const { classes } = this.props;

    return (
      <div className={ classes.toolbarContent }>
        <TextField fullWidth label="Name" value={ this.state.name } onChange={ this.onNameChange }/>
        <div className={ classes.toolbarContent }>
          { this.renderDeviceSelect() }
          { this.renderLayoutSelect() }
        </div>
        <TreeView
          className={ classes.navigationTree }
          defaultCollapseIcon={ <ExpandMoreIcon /> }
          defaultExpandIcon={ <ChevronRightIcon /> }
        >
          { this.renderResourcesTree() }
          { this.renderEventTriggersTree() }
        </TreeView>
      </div>
    );
  }

  /**
   * Renders layout select
   */
  private renderLayoutSelect = () => {
    const { selectedElement } = this.state;
    if (!selectedElement) {
      return;
    }

    const layoutSelectItems = this.props.layouts.map(layout => {
      return (
        <MenuItem value={ layout.id }>{ layout.name }</MenuItem>
      );
    });

    return (
      <>
        <InputLabel id="pageLayoutId">{ strings.exhibition.pageEditor.pageLayoutLabel }</InputLabel>
        <Select labelId="pageLayoutId" fullWidth value={ (selectedElement as ExhibitionPage).layoutId } onChange={ this.onLayoutChange }>
          { layoutSelectItems }
        </Select>
      </>
    );
  }

  /**
   * Renders device select
   */
  private renderDeviceSelect = () => {
    const { selectedElement } = this.state;
    if (!selectedElement) {
      return;
    }

    const selectItems = this.state.devices.map(device => {
      return (
        <MenuItem value={ device.id }>{ device.name }</MenuItem>
      );
    });

    return (
      <>
        <InputLabel id="pageDeviceId">{ strings.exhibition.pageEditor.pageDeviceLabel }</InputLabel>
        <Select labelId="pageDeviceId" fullWidth value={ (selectedElement as ExhibitionPage).deviceId } onChange={ this.onDeviceChange }>
          { selectItems }
        </Select>
      </>
    );
  }

  /**
   * Renders resources tree
   */
  private renderResourcesTree = () => {
    const parsedCode = this.parseJsonCode();

    const items = (parsedCode.resources || []).map((resource, index) => {
      const label = slugify(`${resource.id}`);
      return <TreeItem nodeId={ `resource-${index}` } label={ label } onClick={ () => this.onResourceNodeClick(resource) } />;
    });

    return (
      <TreeItem nodeId="resources" label="Resources">
        { items }
        <TreeItem nodeId={ "resource-new" } label={ "+ Add resource" } onClick={ this.onAddResourceClick }/>
      </TreeItem>
    );
  }

  /**
   * Renders event triggers tree
   */
  private renderEventTriggersTree = () => {
    const parsedCode = this.parseJsonCode();

    const items = (parsedCode.eventTriggers || []).map((eventTrigger: ExhibitionPageEventTrigger, index) => {
      const label = `Event ${index + 1}`;
      return <TreeItem nodeId={ `event-${index}` } label={ label } onClick={ () => this.onEventTriggerNodeClick(eventTrigger) }>
          {/* <Button onClick={ () => this.onEventTriggerNodeDeleteClick(eventTrigger) } >Delete</Button> */}
      </TreeItem>;
    });

    return (
      <TreeItem nodeId="event-triggers" label="Event Triggers">
        { items }
        <TreeItem nodeId={ "event-trigger-new" } label={ "+ Add event trigger" } onClick={ this.onAddEventTriggerClick }/>
      </TreeItem>
    );
  }

  /**
   * Renders resource editor
   */
  private renderResourceEditor = () => {
    const selectedResource = this.state.selectedResource;
    if (!selectedResource) {
      return null;
    }

    const { classes } = this.props;

    const title = <Typography variant="h6">{ selectedResource.id }: { strings.exhibition.properties.title }</Typography>
    const widget = this.findResourceLayoutViewWidget(selectedResource.id);

    if ("ImageView" === widget) {
      return <>
        { title }
        <TextField
          type="url"
          className={ classes.textResourceEditor } 
          label={ strings.exhibition.resources.imageView.properties.imageUrl } variant="outlined"
          value={ this.state.selectedResource?.data }
          onChange={ this.onResourceDataChange }/>
      </>;
    } else if ("TextView" === widget) {
      return <>
        { title }
        <TextField
          multiline
          className={ classes.textResourceEditor } 
          label={ strings.exhibition.resources.textView.properties.text } variant="outlined"
          value={ this.state.selectedResource?.data }
          onChange={ this.onResourceDataChange }/>
      </>

    }

    return <div>{ selectedResource.id } { widget }</div>;
  }

  /**
   * Renders resource editor
   */
  private renderEventTriggerEditor = () => {
    const { selectedEventTrigger, pageLayout } = this.state;
    if (!selectedEventTrigger || !pageLayout) {
      return null;
    }
    const title = <Typography variant="h6">{ strings.exhibition.eventTriggers.title }</Typography>;

    return <>
      { title }
      <EventTriggerEditor
        history = { this.props.history }
        classes = { this.props.classes }
        selectedEventTrigger = { selectedEventTrigger }
        pages = { this.state.pages }
        layout = { pageLayout }
        jsonCode = { this.state.jsonCode }
        onParseJson = { this.parseJsonCode }
        onSaveJson = { this.updateJsonFromChild }
      />
    </>;
  }

  /**
   * Fetches exhibition data
   *
   * @param exhibition exhibition
   */
  private fetchExhibitionData = async (exhibition: Exhibition) => {
    const { accessToken } = this.props;
    const exhibitionId = exhibition.id!;
    const exhibitionContentVersionsApi = Api.getExhibitionContentVersionsApi(accessToken);
    const exhibitionFloorsApi = Api.getExhibitionFloorsApi(accessToken);
    const exhibitionRoomsApi = Api.getExhibitionRoomsApi(accessToken);
    const exhibitionDevicesApi = Api.getExhibitionDevicesApi(accessToken);
    const exhibitionPagesApi = Api.getExhibitionPagesApi(accessToken);
    const exhibitionDeviceGroupApi = Api.getExhibitionDeviceGroupsApi(accessToken);

    const [ contentVersions, floors, rooms, deviceGroups, devices, pages ] =
      await Promise.all<ExhibitionContentVersion[], ExhibitionFloor[], ExhibitionRoom[], ExhibitionDeviceGroup[], ExhibitionDevice[], ExhibitionPage[]>([
        exhibitionContentVersionsApi.listExhibitionContentVersions({ exhibitionId }),
        exhibitionFloorsApi.listExhibitionFloors({ exhibitionId }),
        exhibitionRoomsApi.listExhibitionRooms({ exhibitionId }),
        exhibitionDeviceGroupApi.listExhibitionDeviceGroups({ exhibitionId: exhibitionId }),
        exhibitionDevicesApi.listExhibitionDevices({ exhibitionId }),
        exhibitionPagesApi.listExhibitionPages({ exhibitionId })
      ]);

    const treeData = this.constructTreeData({
      exhibition,
      contentVersions,
      floors,
      rooms,
      devices,
      pages
    });

    this.setState({
      contentVersions: contentVersions,
      floors: floors,
      rooms: rooms,
      deviceGroups: deviceGroups,
      devices: devices,
      pages: pages,
      treeData: treeData
    });
  }

  /**
   * Code mirror lint method
   *
   * @param content editor content
   * @param _options options
   * @param _codeMirror editor instance
   * @returns annotations
   */
  private jsonEditorGetAnnotations = (content: string, _options: codemirror.LintStateOptions, _codeMirror: codemirror.Editor): codemirror.Annotation[] => {
    const found: codemirror.Annotation[] = [];
    const parser = jsonlint.parser;

    parser.parseError = (message: string, hash: JsonLintParseErrorHash) => {
      const loc = hash.loc;
      found.push({
        from: codemirror.Pos(loc.first_line - 1, loc.first_column),
        to: codemirror.Pos(loc.last_line - 1, loc.last_column),
        message: message
      });
    };

    try {
      parser.parse(content);
      // eslint-disable-next-line no-empty
    } catch (e) {

    }

    if (found.length === 0) {
      this.parseJsonCode((message: string, _e?: SyntaxError) => {
        found.push({
          from: codemirror.Pos(0, 0),
          to: codemirror.Pos(0, 0),
          message: message
        });
      });
    }

    return found;
  }

  /**
   * Parses JSON code from the editor
   *
   * @param errorHandler error handler for the parsing errors
   * @returns parsed JSON code from the editor
   */
  private parseJsonCode = (errorHandler?: (message: string, e?: SyntaxError) => void) => {
    const result: Partial<ExhibitionPage> = {
      eventTriggers: [],
      resources: []
    };

    try {
      const parsedCode = JSON.parse(this.state.jsonCode);
      result.eventTriggers = (parsedCode.eventTriggers || []).map(ExhibitionPageEventTriggerFromJSON);
      result.resources = (parsedCode.resources || []).map(ExhibitionPageResourceFromJSON);

      if (errorHandler) {
        this.validateParsedPage(result, errorHandler);
      }


    } catch (e) {
      if (errorHandler) {
        errorHandler(e.message, e);
      }
    }

    return result;
  }

  /**
   * Validates parsed page
   *
   * @param parsedPage parsed page
   * @param errorHandler parser error handler
   */
  private validateParsedPage = (parsedPage: Partial<ExhibitionPage>, errorHandler: (message: string, e?: SyntaxError) => void) => {
    if (!parsedPage.resources) {
      return errorHandler("Invalid resources");
    }

    if (!parsedPage.eventTriggers) {
      return errorHandler("Invalid event triggers");
    }

    const eventTypes = Object.values(ExhibitionPageEventActionType);

    for (let i = 0; i < parsedPage.resources.length; i++) {
      if (!parsedPage.resources[i].id) {
        return errorHandler(`Resource ${i} requires id`);
      }

      if (!parsedPage.resources[i].data) {
        return errorHandler(`Resource ${i} requires data`);
      }

      if (!parsedPage.resources[i].type) {
        return errorHandler(`Resource ${i} requires type`);
      }
    }

    for (let i = 0; i < parsedPage.eventTriggers.length; i++) {
      const events = parsedPage.eventTriggers[i].events || [];

      for (let j = 0; j < events.length; j++) {
        const eventAction = events[j].action;

        if (!eventAction) {
          return errorHandler(`Event ${i} requires an action`);
        }

        if (!eventTypes.includes(eventAction)) {
          return errorHandler(`Event ${i} action ${events[j].action} is not valid (${eventTypes.join(", ")})`);
        }
      }
    }
  }

  /**
   * Returns unique id
   *
   * @param idPrefix id prefix
   * @param existingIds existing ids
   * @return unique id
   */
  private getUniqueId = (idPrefix: string, existingIds: string[]) => {
    let index = 0;
    let id = idPrefix;

    while (existingIds.includes(id)) {
      index++;
      id = `${idPrefix}-${index}`;
    }

    return id;
  }

  /**
   * Attempts to find a layout view widget for given resource
   *
   * @param resourceId resource id
   * @returns view widget or null if not found
   */
  private findResourceLayoutViewWidget(resourceId: string): string | null {
    const view = this.findResourceLayoutView(resourceId);
    return view?.widget || null;
  }

  /**
   * Attempts to find a layout view for given resource
   *
   * @param resourceId resource id
   * @returns view or null if not found
   */
  private findResourceLayoutView(resourceId: string): PageLayoutView | null {
    const { selectedElement } = this.state;
    if (!selectedElement) {
      return null;
    }
    const layout = this.props.layouts.find(item => item.id === (selectedElement as ExhibitionPage).layoutId);
    if (!layout) {
      return null;
    }

    const propertyValue = `@resources/${resourceId}`;
    const root = layout.data;
    if (root.properties.findIndex(property => property.value === propertyValue) > -1) {
      return root;
    }

    return this.findLayoutViewByPropertyValue(root, propertyValue);
  }

  /**
   * Attempts to find a child view with given property value
   *
   * @param view root view
   * @param propertyValue property value
   * @returns view or null if not found
   */
  private findLayoutViewByPropertyValue(view: PageLayoutView, propertyValue: string): PageLayoutView | null  {
    for (let i = 0; i < view.children.length; i++) {
      const child = view.children[i];
      if (child.properties.findIndex(property => property.value === propertyValue) > -1) {
        return child;
      }

      const result = this.findLayoutViewByPropertyValue(child, propertyValue);
      if (result) {
        return result;
      }
    }

    return null;
  }

  /**
   * Event handler for resource add click
   */
  private onAddResourceClick = () => {
    const parsedCode = this.parseJsonCode();
    parsedCode.resources = (parsedCode.resources || []);
    const ids = parsedCode.resources.map(resource => resource.id);

    parsedCode.resources.push({
      "id": this.getUniqueId("new", ids),
      "data": "https://example.com",
      "type": ExhibitionPageResourceType.Image
    });

    this.setState({
      jsonCode: this.toJsonCode(parsedCode)
    });
  }

  /**
   * Event handler for event trigger add click
   */
  private onAddEventTriggerClick = () => {
    const parsedCode = this.parseJsonCode();
    parsedCode.eventTriggers = (parsedCode.eventTriggers || []);

    parsedCode.eventTriggers.push({
      clickViewId: (parsedCode.eventTriggers.length + 1).toString(),
      delay: 0,
      events: [],
      next: []
    });

    this.setState({
      jsonCode: this.toJsonCode(parsedCode)
    });
  }

  /**
   * Event handler for resource node click
   *
   * @param resource selected node
   */
  private onResourceNodeClick = (resource: ExhibitionPageResource) => {
    this.setState({
      selectedEventTrigger: undefined,
      selectedResource: resource
    });
  }

  /**
   * Event handler for event trigger node click
   *
   * @param eventTrigger selected node
   */
  private onEventTriggerNodeClick = (eventTrigger: ExhibitionPageEventTrigger) => {

    this.setState({
      selectedEventTrigger: eventTrigger,
      selectedResource: undefined
    });
  }

  /**
   * Event handler for name input change
   *
   * @param event event
   */
  private onResourceDataChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedResource = this.state.selectedResource;
    if (!selectedResource) {
      return null;
    }

    const parsedCode = this.parseJsonCode();
    parsedCode.resources = parsedCode.resources || [];
    const index = parsedCode.resources.findIndex(resource => selectedResource.id === resource.id);
    if (index > -1) {
      parsedCode.resources[index].data = event.target.value;

      this.setState({
        selectedResource: parsedCode.resources[index],
        jsonCode: this.toJsonCode(parsedCode)
      });
    }
  }

  /**
   * Event handler for name input change
   *
   * @param event event
   */
  private onNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      name: event.target.value
    });
  }

  /**
   * Update json from child component. Atm updated only event triggers
   */
  private updateJsonFromChild = (eventTrigger?: ExhibitionPageEventTrigger, parsedCode?: Partial<ExhibitionPage>) => {
    if (parsedCode !== undefined) {
      this.setState({
        selectedEventTrigger: eventTrigger,
        jsonCode: this.toJsonCode(parsedCode)
      });
    }
  }

  /**
   * Event handler for layout change
   *
   * @param event event
   */
  private onLayoutChange = (event: React.ChangeEvent<{ name?: string; value: any }>) => {
    const { selectedElement } = this.state;
    if (!selectedElement) {
      return;
    }

    this.setState({
      selectedElement: { ...selectedElement, layoutId: event.target.value }
    });
  }

  /**
   * Event handler for device change
   *
   * @param event event
   */
  private onDeviceChange = (event: React.ChangeEvent<{ name?: string; value: any }>) => {
    const { selectedElement } = this.state;
    if (!selectedElement) {
      return;
    }

    this.setState({
      selectedElement: { ...selectedElement, deviceId: event.target.value }
    });
  }

  /**
   * Event handler for before JSON code change event
   *
   * @param _editor editor instance
   * @param _data editor data
   * @param value code
   */
  private onBeforeJsonCodeChange = (_editor: codemirror.Editor, _data: codemirror.EditorChange, value: string) => {
    this.setState({
      jsonCode: value
    });
  }

  /**
   * Event listener for switch view button click
   */
  private onSwitchViewClick = () => {
    this.setState({
      view: this.state.view === "CODE" ? "VISUAL" : "CODE"
    });
  }

  /**
   * Event handler for save button click
   */
  private onSaveClick = () => {
    const { selectedElement } = this.state;
    if (!selectedElement) {
      return;
    }
    const updatedPageData = selectedElement as ExhibitionPage;
    const parsedCode = this.parseJsonCode();

    this.onPageSave({
      ...updatedPageData,
      layoutId: updatedPageData.layoutId,
      deviceId: updatedPageData.deviceId,
      name: updatedPageData.name,
      contentVersionId: updatedPageData.contentVersionId,
      eventTriggers: parsedCode.eventTriggers || [],
      resources: parsedCode.resources || []
    });
  }

  /**
   * Serializes the page into JSON code
   *
   * @returns JSON
   */
  private toJsonCode = (page: Partial<ExhibitionPage>): string => {
    const { resources, eventTriggers } = page;

    return JSON.stringify({
      resources: resources,
      eventTriggers: eventTriggers
    }, null, 2);
  }

  /**
   * Event handler for add page click
   */
  private onAddPageClick = () => {
    const layoutId = this.props.layouts && this.props.layouts.length ? this.props.layouts[0].id : null;
    const deviceId = this.props.devices && this.props.devices.length ? this.props.devices[0].id : null;

    if (!layoutId || !deviceId) {
      return null;
    }

    const newPage: ExhibitionPage = {
      layoutId: layoutId,
      deviceId: deviceId,
      name: strings.exhibition.newPage,
      contentVersionId: "",
      eventTriggers: [],
      resources: []
    }

    this.setState({
      selectedElement: newPage
    });
  }

  /**
   * Event handler for add device click
   */
  private onAddDeviceClick = () => {
    this.setState({
      addDevice: {
        name: strings.exhibition.addDeviceEditor.defaultName,
        modelId: this.props.deviceModels[0]?.id,
        groupId: this.state.selectedDeviceGroupId,
        screenOrientation: ScreenOrientation.Portrait
      }
    }); 
  }

  /**
   * Event handler for page save
   *
   * @param page page
   */
  private onPageSave = async (page: ExhibitionPage) => {
    try {
      const exhibitionPagesApi = Api.getExhibitionPagesApi(this.props.accessToken);
      if (page.id) {
        const updatedPage = await exhibitionPagesApi.updateExhibitionPage({
          exhibitionId: this.props.exhibitionId,
          pageId: page.id,
          exhibitionPage: page
        });

        const pages = this.state.pages.filter(item => item.id !== updatedPage.id) || [];

        this.setState({
          pages: [ ...pages, updatedPage ]
        }, () => {
          this.setState({
            treeData: this.reconstructTreeData()
          });
        });

      } else {
        const createdPage = await exhibitionPagesApi.createExhibitionPage({
          exhibitionId: this.props.exhibitionId,
          exhibitionPage: page
        });

        this.setState({
          pages: [ ...this.state.pages || [], createdPage ]
        });
      }
    } catch (e) {
      console.error(e);

      this.setState({
        error: e
      });
    }
  }

  /**
   * Handle dashboard click
   */
  private onDashboardButtonClick = () => {
    this.props.history.push(`/dashboard/overview`);
  }

  /**
   * Handles element selected from navigation tree
   *
   * @param element selected element
   * @param elementType selected element type
   */
  private onSelectElementFromTree = (element: ExhibitionElement, elementType: ExhibitionElementType) => {
    this.setState({ 
      selectedDeviceGroupId: undefined,
      selectedRoomId: undefined,
      addDevice: undefined
    });

    switch (elementType) {
      case ExhibitionElementType.EXHIBITION:
      break;
      case ExhibitionElementType.CONTENT_VERSION:
      break;
      case ExhibitionElementType.FLOOR:
      break;
      case ExhibitionElementType.ROOM:
        const selectedRoom = element as ExhibitionDevice;
        const selectedDeviceGroup = this.state.deviceGroups.find(item => item.roomId === selectedRoom.id); 

        this.setState({
          selectedDeviceGroupId: selectedDeviceGroup?.id,
          selectedRoomId: selectedRoom?.id
        });

      break;
      case ExhibitionElementType.DEVICE:
      break;
      case ExhibitionElementType.PAGE:
        const selectedElement = element as ExhibitionPage;
        const jsonCode = this.toJsonCode(selectedElement);
        const pageLayout = this.props.layouts.find(item => item.id === selectedElement.layoutId);
        this.setState({
          selectedElement,
          jsonCode,
          pageLayout
        });
      break;
      default:
      break;
    }
  }

  /**
   * Event handler for device save button click
   */
  private onAddDeviceSaveClick = async () => {
    const { addDevice } = this.state;
    if (!addDevice) {
      return;
    }

    const { groupId, modelId, name, screenOrientation } = addDevice; 
    if (!groupId || !modelId || !name || !screenOrientation) {
      // TODO: Better error handling
      return;
    }

    const payload: ExhibitionDevice = { ...addDevice, groupId: groupId, modelId: modelId, name: name, screenOrientation: screenOrientation };
    const exhibitionDevicesApi = Api.getExhibitionDevicesApi(this.props.accessToken);
    const createdDevice = await exhibitionDevicesApi.createExhibitionDevice({exhibitionId : this.props.exhibitionId, exhibitionDevice: payload });

    this.setState({
      addDevice: undefined,
      devices: [ ...this.state.devices, createdDevice ]
    }, () => {
      this.setState({
        treeData: this.reconstructTreeData()
      });
    });
  }

  /**
   * Event handler for device name changes
   * 
   * @param event event
   */
  private onAddDeviceNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { target } = event;
    const value: string = target.value;
    this.setState({
      addDevice: { ...this.state.addDevice, name: value } 
    });
  }

  /**
   * Event handler for screen orientation select change
   *
   * @param event event
   * @param _child child node
   */
  private onAddDeviceScreenOrientationChange = (e: React.ChangeEvent<{ name?: string | undefined; value: unknown }>, _child: React.ReactNode) => {
    this.setState({
      addDevice: { ...this.state.addDevice, screenOrientation: e.target.value as ScreenOrientation }
    });
  }

  /**
   * Event handler for screen orientation select change
   *
   * @param event event
   * @param _child child node
   */
  private onAddDeviceModelChange = (e: React.ChangeEvent<{ name?: string | undefined; value: unknown }>, _child: React.ReactNode) => {
    this.setState({
      addDevice: { ...this.state.addDevice, modelId: e.target.value as string }
    });
  }

  /**
   * Constructs tree data
   *
   * @param dataParams tree data params
   */
  private constructTreeData = (dataParams: TreeDataParams) => {
    const { exhibitionId } = this.props;
    const { exhibition, contentVersions, floors, rooms, devices, pages } = dataParams;
    const treeData = [{
      key: exhibitionId,
      label: exhibition.name,
      element: exhibition,
      elementType: ExhibitionElementType.EXHIBITION,
      nodes: contentVersions.map(contentVersion => {
        return {
          key: contentVersion.id!,
          label: contentVersion.name,
          element: contentVersion,
          elementType: ExhibitionElementType.CONTENT_VERSION,
          nodes: floors.map(floor => {
            return {
              key: floor.id!,
              label: floor.name,
              element: floor,
              elementType: ExhibitionElementType.FLOOR,
              nodes: rooms.filter(room => room.floorId === floor.id).map(room => {
                return {
                  key: room.id!,
                  label: room.name,
                  element: room,
                  elementType: ExhibitionElementType.ROOM,
                  nodes: devices.map(device => {
                    return {
                      key: device.id!,
                      label: device.name,
                      element: device,
                      elementType: ExhibitionElementType.DEVICE,
                      nodes: pages.filter(page => page.deviceId === device.id).map(page => {
                        return {
                          key: page.id!,
                          label: page.name,
                          element: page,
                          elementType: ExhibitionElementType.PAGE,
                          nodes: []
                        }
                      })
                    }
                  })
                }
              })
            }
          })
        }
      })
    }];

    return treeData;
  }

  /**
   * Reconstructs tree data from state and props
   * 
   * @return reconstructed tree data
   */
  private reconstructTreeData = () => {
    return this.constructTreeData({
      exhibition: this.props.exhibition,
      contentVersions: this.state.contentVersions,
      floors: this.state.floors,
      rooms: this.state.rooms,
      devices: this.state.devices,
      pages: this.state.pages
    });
  } 

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
    exhibition: state.exhibitions.selectedExhibition as Exhibition,
    layouts: state.layouts.layouts,
    devices: state.devices.devices,
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
    setSelectedExhibition: (exhibition: Exhibition) => dispatch(setSelectedExhibition(exhibition))
  };
}


export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(ExhibitionView));
