import strings from "../../../../localization/strings";
import { TreeObject } from "../../../../types";
import { StyledTreeItem } from "./styled-tree-item";
import TreeBranch from "./tree-branch";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import { restrictToFirstScrollableAncestor, restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { AddBoxOutlined } from "@mui/icons-material";
import { TreeView } from "@mui/lab";
import { Button, Stack } from "@mui/material";

/**
 * Components properties
 */
interface Props {
  treeObjects: TreeObject[];
  selectedComponent?: TreeObject;
  onTreeComponentSelect: (selectedComponent?: TreeObject) => void;
  onAddComponentClick: (path: string, asChildren: boolean) => void;
}

/**
 * Layout Tree Menu HTML Component
 */
const LayoutTreeMenuHtml = ({
  treeObjects,
  selectedComponent,
  onTreeComponentSelect,
  onAddComponentClick
}: Props) => {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 10 } }));

  /**
   *
   * @param event event
   */
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    // if (active.id !== over?.id) {
    //   const oldIndex = columns.findIndex((column) => column.field === active.id);
    //   const newIndex = columns.findIndex((column) => column.field === over?.id);

    //   const newOrderedList = arrayMove(columns, oldIndex, newIndex);

    //   setColumns(newOrderedList);
    // }
  };

  /**
   * Renders Add New Element button
   */
  const renderAddNewElementButton = (item: TreeObject, asChildren: boolean) => (
    <Button
      variant="text"
      size="small"
      sx={{
        textTransform: "uppercase",
        fontWeight: 400,
        fontSize: "0.65rem",
        color: "#2196F3",
        flexWrap: "wrap",
        display: selectedComponent?.id === item.id ? "block" : "none"
      }}
      onClick={() => onAddComponentClick(item.path, asChildren)}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-evenly">
        <AddBoxOutlined sx={{ color: "#2196F3" }} />
        {strings.layoutEditor.addLayoutViewDialog.title}
      </Stack>
    </Button>
  );

  /**
   * Renders Tree Item
   *
   * @param item item
   * @param isRoot is root element
   * @param isRootSubDirectory is root element of sub-directory in tree
   */
  const renderTreeItem = (item?: TreeObject, isRoot?: boolean, isRootSubdirectory?: boolean) => {
    if (!item) return;

    const hasChildren = !!item.children?.length;

    return (
      <SortableContext
        items={treeObjects.map((obj) => obj.id)}
        strategy={verticalListSortingStrategy}
      >
        <Stack key={item.id}>
          <StyledTreeItem
            nodeId={item.id}
            itemType={item.type}
            itemName={item.name || strings.generic.name}
            isRoot={isRoot}
            isRootSubdirectory={isRootSubdirectory}
            hasChildren={hasChildren}
            onClick={() => onTreeComponentSelect(item)}
            onDoubleClick={() => {
              if (selectedComponent?.id === item.id) {
                onTreeComponentSelect(undefined);
              }
            }}
          >
            <TreeBranch
              treeObjects={item.children}
              selectedComponent={selectedComponent}
              onTreeComponentSelect={onTreeComponentSelect}
              onAddComponentClick={onAddComponentClick}
              handleDragEnd={handleDragEnd}
            />
          </StyledTreeItem>
          {renderAddNewElementButton(item, false)}
        </Stack>
      </SortableContext>
    );
  };

  /**
   * Gets parent ids, based on selected path.
   * This is being used to expand the tree view automatically after adding a new element.
   * In case of the root element we return the path as is.
   *
   * @param path path
   * @retuns IDs of parent elements
   */
  const getParentIds = (): string[] => {
    if (!selectedComponent) {
      return [];
    }

    const { path, type } = selectedComponent;

    if (!path || !type) {
      return [];
    }

    const slashes = path?.match(/\//g)?.length ?? 0;

    if (!slashes) {
      return [path];
    }

    const parentIds: string[] = [];
    for (let i = 0; i <= slashes; i++) {
      if (path?.split("/")[i]) {
        parentIds.push(path?.split("/")[i]);
      }
    }

    return parentIds;
  };

  return (
    <TreeView expanded={getParentIds()}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis, restrictToFirstScrollableAncestor]}
      >
        {treeObjects.map((item) => renderTreeItem(item, true))}
      </DndContext>
    </TreeView>
  );
};

export default LayoutTreeMenuHtml;
