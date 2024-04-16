import { ALLOWED_CHILD_NODE_NAMES, TEXT_NODE_TYPE } from "../components/content-editor/constants";
import {
  ExhibitionPageResource,
  ExhibitionPageResourceType,
  LayoutType,
  PageLayout,
  PageLayoutViewHtml,
  PageResourceMode
} from "../generated/client";
import { HtmlComponentType, TreeObject } from "../types";
import GenericUtils from "./generic-utils";
import HtmlComponentsUtils from "./html-components-utils";
import { v4 as uuid } from "uuid";

type ResourceAttributeMap = Record<string, string>;

/**
 * Utility functions for handling html resources
 */
namespace HtmlResourceUtils {
  /**
   * Checks whether style attribute value is a valid resource
   *
   * @param value style attribute value
   * @param resources resources
   * @returns true if value is a valid resource, false otherwise
   */
  const checkStyleResource = (value: string, resources: ExhibitionPageResource[]): boolean => {
    if (value.startsWith("@resources/")) {
      const foundResource = resources.find(
        (resource) => resource.id === value.replace("@resources/", "")
      );
      return !!foundResource;
    }

    return false;
  };

  /**
   * Updates default style resources of a tree branch of layout components
   *
   * @param element element
   * @param resources resources
   * @returns updated resources
   */
  const updateDefaultStyleResourcesOfTree = (
    branch: TreeObject,
    resources: ExhibitionPageResource[]
  ): ExhibitionPageResource[] => {
    let updatedResources = [...resources];
    const styleMap = HtmlComponentsUtils.parseStyles(branch.element);
    let hasBackgroundColorResource = false;
    let backgroundColorResourceValue = "";
    let hasBackgroundImageResource = false;
    let backgroundImageResourceValue = "";
    for (const [key, value] of Object.entries(styleMap)) {
      if (key === "background-color") {
        backgroundColorResourceValue = value;
        hasBackgroundColorResource = checkStyleResource(value, resources);
      }
      if (key === "background-image" && branch.type === HtmlComponentType.LAYOUT) {
        backgroundImageResourceValue = value;
        hasBackgroundImageResource = checkStyleResource(value, resources);
      }
    }
    if (!hasBackgroundColorResource) {
      const backgroundColorResource: ExhibitionPageResource = {
        id: uuid(),
        data: GenericUtils.hexToRGB(backgroundColorResourceValue) || "transparent",
        mode: PageResourceMode.Static,
        type: ExhibitionPageResourceType.Color
      };
      styleMap["background-color"] = `@resources/${backgroundColorResource.id}`;
      updatedResources = [...updatedResources, backgroundColorResource];
    }

    if (!hasBackgroundImageResource) {
      const backgroundImageResource: ExhibitionPageResource = {
        id: uuid(),
        data: backgroundImageResourceValue || "none",
        mode: PageResourceMode.Static,
        type: ExhibitionPageResourceType.Image
      };
      styleMap["background-image"] = `@resources/${backgroundImageResource.id}`;
      updatedResources = [...updatedResources, backgroundImageResource];
    }

    HtmlComponentsUtils.updateStyles(branch.element, styleMap);

    for (const child of branch.children) {
      updatedResources = [...updateDefaultStyleResourcesOfTree(child, updatedResources)];
    }

    return updatedResources;
  };

  /**
   * Updates default style resources of a tree of layout components
   *
   * @param tree tree
   * @param layout layout
   * @returns updated resources
   */
  export const updateDefaultStyleResources = (tree: TreeObject[], layout: PageLayout) => {
    let resources = layout.defaultResources || [];
    for (const branch of tree) {
      resources = [...updateDefaultStyleResourcesOfTree(branch, resources)];
    }

    return resources;
  };

  /**
   * Returns the resource ids and corresponding attributes
   *
   * @param html string
   * @returns resources HTML elements and its resource ids and datas
   */
  export const getResourceAttributeMap = (element: HTMLElement): ResourceAttributeMap => {
    const resources: Record<string, string> = {};
    const styleMap = HtmlComponentsUtils.parseStyles(element);

    for (const style in styleMap) {
      if (styleMap[style].startsWith("@resources/")) {
        resources[style] = styleMap[style];
      }
    }

    return resources;
  };

  export const getDefaultStyleResourcesForElement = (
    element: HTMLElement
  ): ExhibitionPageResource[] => {
    const resources: ExhibitionPageResource[] = [];
    const resourceAttributeMap = getResourceAttributeMap(element);

    for (const key in resourceAttributeMap) {
      const resourceType = getResourceTypeForAttribute(key);
      if (resourceType) {
        resources.push({
          id: resourceAttributeMap[key].replace("@resources/", ""),
          type: resourceType,
          mode: PageResourceMode.Static,
          data: getDefaultResourceValueForStyleAttribute(key) ?? ""
        });
      }
    }

    return resources;
  };

  export const getDefaultResourcesForComponent = (
    component: TreeObject
  ): ExhibitionPageResource[] => {
    const { element } = component;
    const defaultStyleResources = getDefaultStyleResourcesForElement(element);
    const resourceIds = extractResourceIds(element.outerHTML).filter(
      (id) => !defaultStyleResources.find((resource) => resource.id === id)
    );

    return [
      ...defaultStyleResources,
      ...resourceIds.map((resourceId) => ({
        id: resourceId,
        data: "",
        type: getResourceType(component.type),
        mode: PageResourceMode.Static
      }))
    ];
  };

  /**
   * Returns the resource id from a resource path
   *
   * @param resourcePath resource path
   * @returns resource id
   */
  export const getResourceId = (resourcePath: string | undefined | null) =>
    resourcePath?.replace("@resources/", "");

  /**
   * Returns the resource path from a resource id
   *
   * @param resourceId resource id
   * @returns resource path
   */
  export const getResourcePath = (resourceId: string | undefined | null) =>
    resourceId ? `@resources/${resourceId}` : undefined;

  /**
   * Returns the resource based on a resource path
   *
   * @param resources resources
   * @param resourcePath resource path
   * @returns resource or null if not found
   */
  export const getResource = (
    resources: ExhibitionPageResource[] | undefined,
    resourcePath: string | undefined | null
  ) => {
    if (!resources || !resourcePath) return;
    return resources.find((resource) => resource.id === getResourceId(resourcePath)) || null;
  };

  /**
   * Returns the resource data based on a resource path
   *
   * @param resources resources
   * @param resourcePath resource path
   * @returns resource data or null if not found
   */
  export const getResourceData = (
    resources: ExhibitionPageResource[] | undefined,
    resourcePath: string | undefined | null
  ) => {
    const resource = getResource(resources, resourcePath);
    return resource?.data;
  };

  /**
   * Extracts layout resource ids from given html string
   *
   * @param html html string
   * @returns found resource ids
   */
  export const extractResourceIds = (html: string) =>
    html
      .match(/@resources\/[a-zA-Z0-9-]{1,}/gm)
      ?.map((match) => match.replace("@resources/", "")) ?? [];

  /**
   * Returns default resources for given layout. If resources are missing from default resources, they are added.
   *
   * @param layout layout
   * @returns layout default resources
   */
  export const getLayoutDefaultResources = (layout: PageLayout): ExhibitionPageResource[] => {
    if (layout.layoutType === LayoutType.Html) {
      const layoutData = layout.data as PageLayoutViewHtml;
      const defaultResources = layout.defaultResources || [];
      const resourceIds = HtmlResourceUtils.extractResourceIds(layoutData.html);

      return resourceIds.map((resourceId) => {
        return (
          defaultResources.find((resource) => resource.id === resourceId) || {
            id: resourceId,
            data: "",
            mode: PageResourceMode.Static,
            type: ExhibitionPageResourceType.Html
          }
        );
      });
    } else {
      throw new Error(`Unsupported layout type ${layout.layoutType}`);
    }
  };

  /**
   * Extracts resource ids from given tree object
   *
   * @param treeObject tree object
   * @returns resource ids found in tree object
   */
  export const getTreeObjectResourceIds = (treeObject: TreeObject) => {
    const elementClone = treeObject.element.cloneNode(false) as HTMLElement;

    for (const childNode of treeObject.element.childNodes) {
      if (
        childNode.nodeType === TEXT_NODE_TYPE ||
        ALLOWED_CHILD_NODE_NAMES.includes(childNode.nodeName)
      ) {
        elementClone.appendChild(childNode.cloneNode());
      }
    }

    return extractResourceIds(elementClone.outerHTML);
  };

  /**
   * Gets resource type for given component type
   *
   * @param type type
   */
  export const getResourceType = (type: HtmlComponentType) =>
    ({
      [HtmlComponentType.IMAGE]: ExhibitionPageResourceType.Image,
      [HtmlComponentType.VIDEO]: ExhibitionPageResourceType.Video,
      [HtmlComponentType.TEXT]: ExhibitionPageResourceType.Text,
      [HtmlComponentType.BUTTON]: ExhibitionPageResourceType.Text,
      [HtmlComponentType.TABS]: ExhibitionPageResourceType.Text,
      [HtmlComponentType.TAB]: ExhibitionPageResourceType.Text,
      [HtmlComponentType.LAYOUT]: ExhibitionPageResourceType.Image,
      [HtmlComponentType.IMAGE_BUTTON]: ExhibitionPageResourceType.Image
    })[type];

  /**
   * Gets resource type for given css attribute
   *
   * @param attribute css attribute
   * @returns resource type
   */
  export const getResourceTypeForAttribute = (attribute: string) =>
    ({
      "background-image": ExhibitionPageResourceType.Image,
      "background-color": ExhibitionPageResourceType.Color
    })[attribute];

  /**
   * Gets resources default value for style attribute
   *
   * @param attribute style attribute
   * @returns default resource value
   */
  export const getDefaultResourceValueForStyleAttribute = (attribute: string) =>
    ({
      "background-image": "none",
      "background-color": "transparent"
    })[attribute];

  /**
   * Gets background color resource default value
   *
   * @param id resource id
   * @returns default value
   */
  export const getBackgroundColorResourceDefaultValue = (id: string) => ({
    id: id,
    data: "transparent",
    type: ExhibitionPageResourceType.Color,
    mode: PageResourceMode.Static
  });
}

export default HtmlResourceUtils;
