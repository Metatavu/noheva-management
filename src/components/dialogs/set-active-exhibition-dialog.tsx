import { Stack, Typography } from "@mui/material";
import { Exhibition } from "../../generated/client";
import strings from "../../localization/strings";
import GenericDialog from "../generic/generic-dialog";

/**
 * Components properties
 */
interface Props {
  open: boolean;
  currentlyActiveExhibition?: Exhibition;
  newActiveExhibition?: Exhibition;
  onConfirm: (exhibition: Exhibition) => Promise<void>;
  onClose: () => void;
}

/**
 * Set Active Exhibition Dialog component
 */
const SetActiveExhibitionDialog = ({
  open,
  currentlyActiveExhibition,
  newActiveExhibition,
  onConfirm,
  onClose
}: Props) => {
  if (!currentlyActiveExhibition || !newActiveExhibition) return null;
  /**
   * Event handler for dialog confirm click
   */
  const onConfirmClick = async () => {
    await onConfirm(newActiveExhibition);
  };

  return (
    <GenericDialog
      open={open}
      title={strings.exhibitions.setActiveExhibitionDalog.title}
      positiveButtonText={strings.exhibitions.setActiveExhibitionDalog.setActiveButton}
      cancelButtonText={strings.generic.cancel}
      onClose={onClose}
      onCancel={onClose}
      onConfirm={onConfirmClick}
    >
      <Stack spacing={2}>
        <Typography>
          {strings.formatString(
            strings.exhibitions.setActiveExhibitionDalog.currentlyActiveExhibition,
            currentlyActiveExhibition.name
          )}
        </Typography>
        <Typography>
          {strings.formatString(
            strings.exhibitions.setActiveExhibitionDalog.newActiveExhibition,
            newActiveExhibition.name
          )}
        </Typography>
      </Stack>
    </GenericDialog>
  );
};

export default SetActiveExhibitionDialog;
