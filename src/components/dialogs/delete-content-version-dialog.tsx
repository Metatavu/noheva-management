import { ExhibitionPage } from "../../generated/client";
import strings from "../../localization/strings";
import { MultiLingualContentVersion } from "../../types";
import GenericDialog from "../generic/generic-dialog";
import { Box, Typography, Checkbox, FormControlLabel } from "@mui/material";
import { ChangeEvent, useState } from "react";

/**
 * Components properties
 */
interface Props {
  open: boolean;
  dependingExhibitionPages: ExhibitionPage[];
  multiLingualContentVersion: MultiLingualContentVersion;
  onClose: () => void;
  onDelete: (multiLingualContentVersion: MultiLingualContentVersion, exhibitionPages: ExhibitionPage[]) => Promise<void>;
}

/**
 * Delete content version dialog
 */
const DeleteContentVersionDialog = ({ 
  open,
  multiLingualContentVersion, 
  dependingExhibitionPages,
  onClose, 
  onDelete
}: Props) => {

  const [confirmPagesRemoval, setConfirmPagesRemoval] = useState(false);

  /**
   * Event handler for delete button click
   */
  const handleDelete = async () => {
    await onDelete(multiLingualContentVersion, dependingExhibitionPages);
    handleClose();
  };

  /**
   * Event handler for on close events
   */
  const handleClose = () => {
    onClose();
  };

  /**
   * Renders the warning message if there are depending exhibition pages
   */
  const renderWarning = () => {
    if (dependingExhibitionPages.length > 0) {
      return (
        <Box mt={2}>
          <Typography color={"error"} variant="body2">
            { strings.contentVersion.deleteDialog.pagesWarning }
          </Typography>
          <Box mt={2} style={{ maxHeight: "200px", overflowY: "auto" }}>
            {
              dependingExhibitionPages.map((exhibitionPage) => (
                <Typography key={ exhibitionPage.id }>
                  { exhibitionPage.name }
                </Typography>
              ))
            }
          </Box>
          <Box>
            <FormControlLabel control={
              <Checkbox
                checked={ confirmPagesRemoval }
                onChange={(e: ChangeEvent<HTMLInputElement>) => setConfirmPagesRemoval(e.target.checked)}
                color="primary"
                inputProps={{ "aria-label": "secondary checkbox" }}
              />
            } label={ strings.contentVersion.deleteDialog.confirmPagesRemoval } />

          </Box>
        </Box>
      );
    }

    return null;
  }

  return (
    <GenericDialog
      title={strings.generic.delete}
      fullWidth
      open={ open }
      onClose={ handleClose }
      onConfirm={ handleDelete }
      positiveButtonText={ strings.generic.delete }
      cancelButtonText={ strings.generic.cancel }
      confirmDisabled={ !confirmPagesRemoval && dependingExhibitionPages.length > 0 }
      onCancel={handleClose}
    >
      <Box mt={2}>
        <Typography>
          { strings.contentVersion.deleteDialog.text }
        </Typography>
        { renderWarning() }
      </Box>
    </GenericDialog>
  );
};

export default DeleteContentVersionDialog;
