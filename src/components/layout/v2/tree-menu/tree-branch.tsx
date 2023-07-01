import strings from "../../../../localization/strings";
import { TreeObject } from "../../../../types";
import { StyledTreeItem } from "./styled-tree-item";
import { DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { AddBoxOutlined } from "@mui/icons-material";
import { Button, Stack } from "@mui/material";

/**
 * Components properties
 */
interface Props {
  treeObjects: TreeObject[];
  selectedComponent?: TreeObject;
  onTreeComponentSelect: (selectedComponent?: TreeObject) => void;
  onAddComponentClick: (path: string, asChildren: boolean) => void;
  handleDragEnd: (event: DragEndEvent) => void;
}

/**
 * Tree Branch component
 */
const TreeBranch = ({
  treeObjects,
  selectedComponent,
  onTreeComponentSelect,
  onAddComponentClick,
  handleDragEnd
}: Props) => {
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
  const renderTreeItem = (item: TreeObject, isRoot?: boolean, isRootSubdirectory?: boolean) => {
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
            {(item.children ?? []).map((child, i) => {
              const isRootSubDirectory = i === 0;
              return renderTreeItem(child, false, isRootSubDirectory);
            })}
          </StyledTreeItem>
          {renderAddNewElementButton(item, false)}
        </Stack>
      </SortableContext>
    );
  };

  return <>{treeObjects.map((treeObject) => renderTreeItem(treeObject, false))}</>;
};

export default TreeBranch;
