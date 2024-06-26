import { DeviceModel } from "../../generated/client";
import strings from "../../localization/strings";
import theme from "../../styles/theme";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  TextField
} from "@mui/material";
import { useState } from "react";

/**
 * Components properties
 */
interface Props {
  open: boolean;
  deviceModels: DeviceModel[];
  onClose: () => void;
  onCreateNewLayout: (name: string, deviceModelId: string) => Promise<void>;
}

/**
 * Add New Layout Dialog component
 *
 * TODO: Implement support for sub-layouts
 */
const AddNewLayoutDialog: React.FC<Props> = ({
  open,
  deviceModels,
  onClose,
  onCreateNewLayout
}) => {
  const [newLayoutName, setNewLayoutName] = useState<string>();
  const [selectedDeviceModelId, setSelectedDeviceModelId] = useState<string>();

  const isValid = !!newLayoutName && !!selectedDeviceModelId;

  /**
   * Handler for New Layout Name TextField change event
   */
  const onNewLayoutNameChange = ({ target: { value } }: React.ChangeEvent<HTMLInputElement>) =>
    setNewLayoutName(value);

  /**
   * Handler for New Layout Device Model Select change event
   */
  const onDeviceModelChange = ({ target: { value } }: SelectChangeEvent) =>
    setSelectedDeviceModelId(value);

  /**
   * Render device model select
   */
  const renderDeviceModelSelect = () => (
    <FormControl variant="outlined">
      <InputLabel id="screenOrientation-label" style={{ marginTop: theme.spacing(2) }}>
        {strings.layout.settings.deviceModelId}
      </InputLabel>
      <Select
        fullWidth
        style={{ marginTop: theme.spacing(2) }}
        label={strings.devicesV2.model}
        labelId="screenOrientation-label"
        name="modelId"
        value={selectedDeviceModelId ?? ""}
        onChange={onDeviceModelChange}
      >
        {deviceModels.map((model) => (
          <MenuItem key={model.id} value={model.id}>
            {`${model.manufacturer} ${model.model}`}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="add-new-layout-dialog-title">{strings.layout.addNew}</DialogTitle>
      <DialogContent>
        <Stack>
          <TextField
            fullWidth
            variant="outlined"
            label={strings.generic.name}
            name="name"
            value={newLayoutName ?? ""}
            onChange={onNewLayoutNameChange}
          />
          {renderDeviceModelSelect()}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          {strings.generic.cancel}
        </Button>
        <Button
          disableElevation
          variant="contained"
          disabled={!isValid}
          onClick={() => isValid && onCreateNewLayout(newLayoutName, selectedDeviceModelId)}
          color="secondary"
          autoFocus
        >
          {strings.generic.add}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddNewLayoutDialog;
