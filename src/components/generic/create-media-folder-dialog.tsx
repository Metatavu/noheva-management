import strings from "../../localization/strings";
import styles from "../../styles/dialog";
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, InputLabel } from "@mui/material";
import { TextField } from "@mui/material";
import { Button, CircularProgress } from "@mui/material";
import { WithStyles } from "@mui/styles";
import withStyles from "@mui/styles/withStyles";
import { useState } from "react";

/**
 * Component props
 */
interface Props extends WithStyles<typeof styles> {
  open: boolean;
  onClose?: () => void;
  onSave(folderName: string): Promise<void>;
}

/**
 * Dialog component for creating a media folder
 */
const CreateMediaFolderDialog: React.FC<Props> = ({ open, classes, onClose, onSave }) => {
  const [ creating, setCreating ] = useState(false);
  const [ folderName, setFolderName ] = useState("");

  /**
   * Event handler for dialog save click
   */
  const onSaveClick = async () => {
    setCreating(true);
    await onSave(folderName);
    setCreating(false);
  };

  if (creating) {
    return (
      <div className={classes.imageUploadLoaderContainer}>
        <CircularProgress color="secondary" style={{ alignSelf: "center" }} />
      </div>
    );
  }

  /**
   * Event handler for folder name change
   *
   * @param event event
   */
  const onFolderNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFolderName(event.target.value);
  }

  /**
   * Returns true if the folder name is valid
   * 
   * @returns true if the folder name is valid
   */
  const isValidFolderName = () => {
    return folderName.length > 0 && folderName.match(/^[a-zA-Z0-9\s.,_-]+$/);
  };

  return (
    <Dialog
      open={ open }
      onClose={ onClose }
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">{ strings.createMediaFolderDialog.title }</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          <p>{ strings.createMediaFolderDialog.description }</p>
        </DialogContentText>

        <FormControl fullWidth>
          <TextField
            fullWidth
            label={ strings.createMediaFolderDialog.folderName }
            name="folderName"
            value={ folderName }
            onChange={ onFolderNameChange }
          />
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={ onClose } color="primary">
          { strings.createMediaFolderDialog.cancelButton }
        </Button>
        <Button
          disabled={ !isValidFolderName() }
          disableElevation
          variant="contained"
          onClick={ onSaveClick }
          color="secondary"
          autoFocus
        >
          { strings.createMediaFolderDialog.createButton }
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default withStyles(styles)(CreateMediaFolderDialog);
