import * as React from "react";

import Measure, { ContentRect, BoundingRect } from 'react-measure'
import { WithStyles, withStyles } from '@material-ui/core';
import styles from "../../../styles/page-layout-preview";
import { PageLayoutView, PageLayoutViewProperty } from "../../../generated/client";
import { CSSProperties } from "@material-ui/core/styles/withStyles";
import PageLayoutPreviewComponentEditor from "./page-layout-preview-component";
import DisplayMetrics from "../display-metrics";
import AndroidUtils from "../android-utils";

/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
  view: PageLayoutView;
  scale: number;
  displayMetrics: DisplayMetrics;
  onResize?: (contentRect: ContentRect) => void;
  handleLayoutProperties: (properties: PageLayoutViewProperty[], styles: CSSProperties) => CSSProperties;
}

type ChildBounds = { [id: string]: BoundingRect }

/**
 * Interface representing component state
 */
interface State {
  rootBounds?: BoundingRect;
  childBounds: ChildBounds;
}

/**
 * Component for rendering RelativeLayout views
 */
class PageLayoutPreviewRelativeLayout extends React.Component<Props, State> {

  /**
   * Constructor
   * 
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      childBounds: {}
    };
  }

  /**
   * Render
   */
  public render() {
    const { classes } = this.props;
    
    return (
      <Measure onResize={ this.onRootResize } bounds={ true }>
        {({ measureRef }) => (
          <div ref={ measureRef } className={ classes.root } style={ this.resolveStyles() }>
            { this.renderChildren() }
          </div>
        )}
      </Measure>
    );
  }

  /**
   * Renders child component
   */
  private renderChildren = () => {
    const result = (this.props.view.children || []).map((child: PageLayoutView, index: number) => {
      return (
        <PageLayoutPreviewComponentEditor key={ `child-${index}` } 
          view={ child }
          displayMetrics={ this.props.displayMetrics } 
          scale={ this.props.scale }
          style={ this.resolveChildStyles(child) }
          handleLayoutProperties={ this.onHandleLayoutProperties }
          onResize={ (contentRect: ContentRect) => this.onChildResize(child.id, contentRect) }
          />
      );      
    });

    return (
      <div>
        { result }
      </div>
    );
  }

  /**
   * Handles an unknown property logging
   * 
   * @param property unknown property
   * @param reason reason why the property was unknown
   */
  private handleUnknownProperty = (property: PageLayoutViewProperty, reason: string) => {
    console.log(`PageLayoutPreviewRelativeLayout: don't know how to handle layout property because ${reason}`, property.name, property.value);
  }

  /**
   * Resolves child component styles
   * 
   * @param child child
   * @return child component styles
   */
  private resolveChildStyles = (child: PageLayoutView): CSSProperties  => {
    const rightOfChildId = child.properties
      .find(item => item.name === "layout_toRightOf")
      ?.value;
    
    const result: CSSProperties = {
      "position": "absolute"
    };
    
    if (rightOfChildId) {
      const rightOfBounds = this.state.childBounds[rightOfChildId];
      if (rightOfBounds) {
        result.left = rightOfBounds.right - (this.state.rootBounds?.left || 0);
      }
    }


    return result;
  }

  /**
   * Resolves component styles
   * 
   * @returns component styles
   */
  private resolveStyles = (): CSSProperties => {
    const properties = this.props.view.properties;
    const result: CSSProperties = this.props.handleLayoutProperties(properties, {
      position: "absolute"
    });

    properties.forEach(property => {
      if (property.name.startsWith("layout_")) {
        return;
      }

      switch (property.name) {
        case "background":
          result.backgroundColor = property.value;
        break;
        default:
          this.handleUnknownProperty(property, "unknown property");
        break;
      }
    });

    return result;
  }

  /**
   * Updates child bounds into state
   * 
   * @param id child id
   * @param bounds child bounds
   */
  private updateChildBounds = (id: string, bounds: BoundingRect) => {
    const childBounds = { ...this.state.childBounds };
    childBounds[id] = bounds;

    this.setState({
      childBounds: childBounds
    });
  }

  /**
   * Event handler for root component resize
   * '
   * @param contentRect root content rect
   */
  private onRootResize = (contentRect: ContentRect) => {
    this.setState({
      rootBounds: contentRect.bounds
    });

    if (this.props.onResize) {
      this.props.onResize(contentRect);
    }
  }

  /**
   * Event handler for child resize event
   * 
   * @param id child id
   * @param contentRect child content rect
   */
  private onChildResize = (id: string, contentRect: ContentRect) => {
    console.log("resize", id, contentRect);
    if (id && contentRect.bounds) {
      this.updateChildBounds(id, contentRect.bounds);
    }
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
      position: "absolute" 
    };

    childProperties
      .filter(property => property.name.startsWith("layout_"))
      .forEach(property => {
        switch (property.name) {
          case "layout_width":
            if ("match_parent" === property.value) {
              result.width = "100%";
            } else {
              const px = AndroidUtils.stringToPx(this.props.displayMetrics, property.value, this.props.scale);
              if (px) {
                result.width = px
              } else {
                this.handleUnknownProperty(property, "Unknown value");
              }
            }
          break;
          case "layout_height":
            if ("match_parent" === property.value) {
              result.height = "100%";
            } else {
              const px = AndroidUtils.stringToPx(this.props.displayMetrics, property.value, this.props.scale);
              if (px) {
                result.height = px
              } else {
                this.handleUnknownProperty(property, "Unknown value");
              }  
            }
          break;
          default:
            this.handleUnknownProperty(property, "Unknown layout property");
          break;
        }
      });

    return result;
  }
}

export default withStyles(styles)(PageLayoutPreviewRelativeLayout);