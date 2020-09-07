import * as React from "react";

import Measure, { ContentRect } from 'react-measure'
import { WithStyles, withStyles } from '@material-ui/core';
import styles from "../../../styles/page-preview";
import { PageLayoutView, PageLayoutViewProperty } from "../../../generated/client";
import { CSSProperties } from "@material-ui/core/styles/withStyles";
import DisplayMetrics from "../../../types/display-metrics";
import AndroidUtils from "../../../utils/android-utils";
import { ResourceMap } from "../../../types";
import PagePreviewComponentEditor from "./page-preview-component";
import PagePreviewUtils from "./page-preview-utils";
import ReactHtmlParser from "react-html-parser";

/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
  view: PageLayoutView;
  selectedView?: PageLayoutView;
  layer: number;
  resourceMap: ResourceMap;
  scale: number;
  displayMetrics: DisplayMetrics;
  onResize?: (contentRect: ContentRect) => void;
  handleLayoutProperties: (properties: PageLayoutViewProperty[], styles: CSSProperties) => CSSProperties;
  onViewClick?: (view: PageLayoutView) => void;
}

/**
 * Interface representing component state
 */
interface State {
  mouseOver: boolean;
}

/**
 * Component for FlowTextView component preview
 */
class PagePreviewFlowTextView extends React.Component<Props, State> {

  /**
   * Constructor
   * 
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      mouseOver: false
    };
  }

  /**
   * Render basic layout
   */
  public render() {
    const { classes, view, selectedView, onResize } = this.props;
    const { mouseOver } = this.state;
    const selected = selectedView?.id === view.id;

    return (
      <Measure onResize={ onResize } bounds={ true }>
        {({ measureRef }) => (
          <div
            ref={ measureRef }
            style={ this.resolveStyles() }
            className={ mouseOver || selected ? classes.highlighted : "" }
            onClick={ this.onClick }
            onMouseOver={ this.onMouseOver }
            onMouseOut={ this.onMouseOut }
          >
            { this.renderChildren() }
            { this.renderText() }
            { this.getText() }
          </div>
        )}
      </Measure>
    );
  }

  /**
   * Renders layout child components
   */
  private renderChildren = () => {
    const {
      view,
      layer,
      resourceMap,
      displayMetrics,
      scale,
      onViewClick,
    } = this.props;

    const result = (view.children || []).map((child: PageLayoutView, index: number) => {
      return (
        <PagePreviewComponentEditor key={ `child-${index}` }
          view={ child }
          layer={ layer }
          resourceMap={ resourceMap }
          displayMetrics={ displayMetrics }
          scale={ scale }
          handleLayoutProperties={ this.onHandleLayoutProperties }
          onViewClick={ onViewClick }
        />
      );
    });

    return (
      <>
        { result }
      </>
    );
  }

  /**
   * Renders text
   */
  private renderText = () => {
    const text = this.getText();
    if (!text) {
      return null;
    }

    return ReactHtmlParser(text);
  }

  /**
   * Handles an unknown property logging
   * 
   * @param property unknown property
   * @param reason reason why the property was unknown
   */
  private handleUnknownProperty = (property: PageLayoutViewProperty, reason: string) => {
    // console.log(`PagePreviewFlowTextView: don't know how to handle layout property because ${reason}`, property.name, property.value);
  }

  /**
   * Returns text from view properties
   *
   * @return text from view properties
   */
  private getText = () => {
    const textProperty = this.props.view.properties.find(property => property.name === "text");
    const id = textProperty?.value;
    if (id && id.startsWith("@resources/")) {
      const resource = this.props.resourceMap[id.substring(11)];
      if (resource) {
        return resource.data;
      }
    }

    return id;
  }

  /**
   * Resolves component styles
   *
   * @returns component styles
   */
  private resolveStyles = (): CSSProperties => {
    const { view, layer, handleLayoutProperties } = this.props;
    const properties = view.properties;
    const result: CSSProperties = handleLayoutProperties(properties, {
      display: "inline-block",
      zIndex: layer
    });

    properties.forEach(property => {
      if (property.name === "text" || property.name.startsWith("layout_") || property.name.startsWith("inset")) {
        return;
      }

      switch (property.name) {
        case "textSize":
          const px = AndroidUtils.stringToPx(this.props.displayMetrics, property.value, this.props.scale);
          if (px) {
            result.fontSize = px
          } else {
            console.log("FlowTextView: unknown layout_height", property.value);
          }
        break;
        default:
          this.handleUnknownProperty(property, "Unknown property");
        break; 
      }
    });

    return result;
  }

  /**
   * Handles a child component layouting 
   * 
   * @param childProperties child component properties
   * @param childStyles child component styles
   * @return modified child component styles
   */
  private onHandleLayoutProperties = (childProperties: PageLayoutViewProperty[], childStyles: CSSProperties): CSSProperties => {
    const result: CSSProperties = { ...childStyles,
      shapeOutside: "content-box"
    };

    PagePreviewUtils.withDefaultLayoutProperties(childProperties)
      .filter(property => property.name.startsWith("layout_"))
      .forEach(property => {
        switch (property.name) {
          case "layout_width":
            const width = PagePreviewUtils.getLayoutChildWidth(this.props.displayMetrics, property, this.props.scale);
            if (width) {
              result.width = width;
            }
          break;
          case "layout_height":
            const height = PagePreviewUtils.getLayoutChildHeight(this.props.displayMetrics, property, this.props.scale);
            if (height) {
              result.height = height;
            }
          break;
          case "layout_marginTop":
          case "layout_marginRight":
          case "layout_marginBottom":
          case "layout_marginLeft":
            const margin = PagePreviewUtils.getLayoutChildMargin(this.props.displayMetrics, property, this.props.scale);
            if (margin) {
              result[property.name.substring(7)] = margin;
            }
          break;
          case "layout_alignParentLeft":
            result.float = "left";
          break;
          case "layout_alignParentRight":
            result.float = "right";
          break; 
          default:
            this.handleUnknownProperty(property, "Unknown layout property");
          break;
        }
      });

    return result;
  }

  /**
   * Event handler for mouse over
   * 
   * @param event react mouse event
   */
  private onMouseOver = (event: React.MouseEvent) => {
    event.stopPropagation();
    this.setState({ mouseOver: true });
  }

  /**
   * Event handler for mouse out
   * 
   * @param event react mouse event
   */
  private onMouseOut = (event: React.MouseEvent) => {
    event.stopPropagation();
    this.setState({ mouseOver: false });
  }

  /**
   * Event handler for on click
   */
  private onClick = (event: React.MouseEvent) => {
    const { view, onViewClick } = this.props;
    event.stopPropagation();
    onViewClick && onViewClick(view);
  }
}

export default withStyles(styles)(PagePreviewFlowTextView);