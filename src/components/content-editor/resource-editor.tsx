import * as React from "react";
import { ExhibitionPageResource, ExhibitionPageResourceType } from "../../generated/client";
import strings from "../../localization/strings";
import { WithStyles, withStyles, TextField } from "@material-ui/core";
import styles from "../../styles/exhibition-view";
import { ReduxActions, ReduxState } from "../../store";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import MediaLibrary from "../right-panel-editors/media-library";
import produce from "immer";
import { AccessToken, MediaType } from "../../types";

/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
  accessToken: AccessToken;
  title?: string;
  resourceIndex: number;
  resource: ExhibitionPageResource;
  onUpdate: (resourceIndex: number, resource: ExhibitionPageResource) => void;
}

/**
 * Interface representing component state
 */
interface State {
}

/**
 * Component for resource editor
 */
class ResourceEditor extends React.Component<Props, State> {

  /**
   * Constructor
   *
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      loading: false
    };
  }

  /**
   * Component render method
   */
  public render() {
    const { classes, resource, accessToken, title } = this.props;

    switch (resource.type) {
      case ExhibitionPageResourceType.Image:
        return (
          <>
            { title }
            <MediaLibrary
              accessToken={ accessToken }
              mediaType={ MediaType.IMAGE }
              resource={ resource }
              onUrlChange={ this.updateResource }
            />
          </>
        );
      case ExhibitionPageResourceType.Video:
        return (
          <>
            { title }
            <MediaLibrary
              accessToken={ accessToken }
              mediaType={ MediaType.VIDEO }
              resource={ resource }
              onUrlChange={ this.updateResource }
            />
          </>
        );
      case ExhibitionPageResourceType.Text:
        return (
          <>
            { title }
            <TextField
              multiline
              className={ classes.textResourceEditor }
              label={ strings.exhibition.resources.textView.properties.text }
              variant="filled"
              name="data"
              value={ resource.data }
              onChange={ this.onResourceDataChange }
            />
          </>
        );
      default: return <div>{ title }</div>;
    }
  }

  /**
   * Event handler for resource data change
   *
   * @param event React change event
   */
  private onResourceDataChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.updateResource(event.target.value);
  }

  /**
   * Event handler for media change
   *
   * @param value value as string
   */
  private updateResource = (value: string) => {
    const { resource, resourceIndex } = this.props;

    this.props.onUpdate(resourceIndex,
      produce(resource, draft => {
        draft.data = value;
      })
    );
  }
}

/**
 * Redux mapper for mapping store state to component props
 *
 * @param state store state
 */
function mapStateToProps(state: ReduxState) {
  return {
    accessToken: state.auth.accessToken as AccessToken
  };
}

/**
 * Redux mapper for mapping component dispatches
 *
 * @param dispatch dispatch method
 */
function mapDispatchToProps(dispatch: Dispatch<ReduxActions>) {
  return { };
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(ResourceEditor));