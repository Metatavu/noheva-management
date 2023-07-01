import ParentTreeIcon from "../../../../styles/components/layout-screen/parent-tree-icon";
import theme from "../../../../styles/theme";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { SubdirectoryArrowRightRounded } from "@mui/icons-material";
import { TreeItem, TreeItemProps, treeItemClasses } from "@mui/lab";
import { Stack, Typography, styled } from "@mui/material";

/**
 * Styled Tree Item Props type
 */
type StyledTreeItemProps = TreeItemProps & {
  itemType: string;
  itemName: string;
  isRoot?: boolean;
  isRootSubdirectory?: boolean;
  hasChildren?: boolean;
};

/**
 * Styled Tree Item Root styled component
 */
const StyledTreeItemRoot = styled(TreeItem)(({ theme }) => ({
  color: theme.palette.text.secondary,
  [`& .${treeItemClasses.content}`]: {
    color: theme.palette.text.secondary,
    fontWeight: theme.typography.fontWeightMedium,
    "&.Mui-expanded": {
      fontWeight: theme.typography.fontWeightRegular
    },
    "&:hover": {
      backgroundColor: theme.palette.action.hover
    },
    "&.Mui-focused": {
      backgroundColor: `var(--tree-view-bg-color, ${theme.palette.action.selected})`,
      color: "var(--tree-view-color)"
    },
    "&.Mui-selected": {
      backgroundColor: theme.palette.background.default
    },
    [`& .${treeItemClasses.label}`]: {
      fontWeight: "inherit",
      color: "inherit"
    }
  }
}));

/**
 * Styled Tree Item Component
 */
export const StyledTreeItem = ({
  itemType,
  itemName,
  isRoot,
  isRootSubdirectory,
  hasChildren,
  ...other
}: StyledTreeItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: other.nodeId
  });
  return (
    <StyledTreeItemRoot
      ref={setNodeRef}
      sx={{
        transform: CSS.Transform.toString(transform),
        transition: transition
      }}
      {...attributes}
      {...listeners}
      label={
        <Stack direction="row" justifyContent="space-between">
          <div style={{ display: "flex", flexDirection: "row" }}>
            {isRootSubdirectory && (
              <SubdirectoryArrowRightRounded
                sx={{
                  color: "#BDBDBD",
                  alignSelf: "center",
                  marginRight: theme.spacing(2)
                }}
              />
            )}
            {!isRoot && !isRootSubdirectory && <div style={{ marginRight: theme.spacing(5) }} />}
            <Stack direction="column">
              <Typography
                variant="body2"
                sx={{
                  fontWeight: "inherit",
                  flexGrow: 1,
                  color: "#2196F3"
                }}
              >
                {itemName}
              </Typography>
              <Typography>{itemType}</Typography>
            </Stack>
          </div>
          {hasChildren && <ParentTreeIcon />}
        </Stack>
      }
      {...other}
    />
  );
};
