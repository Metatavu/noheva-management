import {
  UnfoldLess as UnfoldLessIcon,
  UnfoldMore as UnfoldMoreIcon,
  SubdirectoryArrowRightRounded as SubdirectoryArrowRightRoundedIcon
} from "@mui/icons-material";
import { TreeItem, treeItemClasses, TreeItemProps } from "@mui/lab";
import { Stack, styled, Typography } from "@mui/material";

/**
 * Styled Tree Item Props type
 */
type StyledTreeItemProps = TreeItemProps & {
  itemType: string;
  itemName: string;
  isLayoutComponent: boolean;
  expanded: boolean;
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
      fontWeight: theme.typography.fontWeightRegular,
    },
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
    },
    "&.Mui-focused": {
      backgroundColor: `var(--tree-view-bg-color, ${theme.palette.action.selected})`,
      color: "var(--tree-view-color)",
    },
    "&.Mui-selected": {
      backgroundColor: theme.palette.background.default
    },
    [`& .${treeItemClasses.label}`]: {
      fontWeight: "inherit",
      color: "inherit",
    },
  }
}
));

/**
 * Styled Tree Item Component
 */
export const StyledTreeItem = ({
  itemType,
  itemName,
  isLayoutComponent,
  expanded,
  isRoot,
  isRootSubdirectory,
  hasChildren,
  ...other
}: StyledTreeItemProps) => {
  /**
   * Renders expand icon
   */
  const renderExpandIcon = () => {
    if (!isLayoutComponent) return;
    if (expanded) return <UnfoldLessIcon htmlColor="#2196F3"/>;
    return <UnfoldMoreIcon htmlColor="#2196F3"/>;
  };
  
  return (
    <StyledTreeItemRoot
      icon={ isRootSubdirectory && <SubdirectoryArrowRightRoundedIcon htmlColor="#BDBDBD"/> }
      {...other}
      label={
        <Stack direction="row" justifyContent="space-between">
          <div style={{ display: "flex", flexDirection: "row" }}>
            <Stack direction="column">
              <Typography
                variant="body2"
                sx={{
                  fontWeight: "inherit",
                  flexGrow: 1,
                  color: "#2196F3"
                }}
              >
                { itemName }
              </Typography>
              <Typography>
                { itemType }
              </Typography>
            </Stack>
          </div>
          { renderExpandIcon() }
        </Stack>
      }
    />
  );
};