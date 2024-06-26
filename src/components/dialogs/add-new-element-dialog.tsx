import strings from "../../localization/strings";
import theme from "../../styles/theme";
import { HtmlComponentType } from "../../types";
import HtmlComponentsUtils from "../../utils/html-components-utils";
import LocalizationUtils from "../../utils/localization-utils";
import GenericDialog from "../generic/generic-dialog";
import { FormHelperText, MenuItem, Stack, TextField } from "@mui/material";
import { ChangeEvent, useState } from "react";

/**
 * Components properties
 */
interface Props {
  open: boolean;
  siblingPath?: string;
  onConfirm: (componentData: string, siblingPath: string) => void;
  onClose: () => void;
}

// TODO: Implement disabled component types
const DISABLED_COMPONENT_TYPES = [HtmlComponentType.TAB, HtmlComponentType.TABS];

/**
 * Add New Element Dialog component
 *
 * TODO: Implement support for sub-layouts
 */
const AddNewElementDialog = ({ open, siblingPath, onConfirm, onClose }: Props) => {
  const [newComponentName, setNewComponentName] = useState<string>();
  const [newComponentType, setNewComponentType] = useState<HtmlComponentType>();

  /**
   * Event handler for dialog confirm click
   */
  const onConfirmClick = () => {
    if (!(siblingPath && newComponentType)) return;

    onConfirm(
      HtmlComponentsUtils.getSerializedHtmlElement(newComponentType, newComponentName),
      siblingPath
    );
    onCloseOrCancelClick();
  };

  /**
   * Event handler for dialog close click
   */
  const onCloseOrCancelClick = () => {
    setNewComponentName(undefined);
    setNewComponentType(undefined);
    onClose();
  };

  /**
   * Event handler for component type select change event
   *
   * @param event event
   */
  const onComponentTypeChange = ({ target: { value } }: ChangeEvent<HTMLInputElement>) =>
    setNewComponentType(value as HtmlComponentType);

  /**
   * Event handler for component name text field change event
   *
   * @param event event
   */
  const onNewLayoutNameChange = ({ target: { value } }: ChangeEvent<HTMLInputElement>) =>
    setNewComponentName(value);

  /**
   * Renders Component types menu items
   *
   * @param type type
   */
  const renderComponentTypesMenuItems = (type: HtmlComponentType) => (
    <MenuItem key={type} disabled={DISABLED_COMPONENT_TYPES.includes(type)} value={type}>
      {LocalizationUtils.getLocalizedComponentType(type)}
    </MenuItem>
  );

  /**
   * Filters disabled component types
   *
   * @param type type
   * @returns true if component type is not disabled, false otherwise
   */
  const filterDisabledComponentTypes = (type: HtmlComponentType) =>
    !DISABLED_COMPONENT_TYPES.includes(type);

  /**
   * Render add layout component dialog
   */
  const renderDialogContent = () => (
    <Stack padding={theme.spacing(1)} sx={{ minWidth: 300 }}>
      <TextField
        select
        label={strings.layoutEditor.addLayoutViewDialog.widget}
        value={newComponentType ?? ""}
        onChange={onComponentTypeChange}
      >
        {Object.values(HtmlComponentType)
          .filter(filterDisabledComponentTypes)
          .map(renderComponentTypesMenuItems)}
      </TextField>
      <FormHelperText>
        {newComponentType && LocalizationUtils.getLocalizedNewComponentHelpText(newComponentType)}
      </FormHelperText>
      <TextField
        sx={{ marginTop: theme.spacing(2) }}
        label={strings.layoutEditor.addLayoutViewDialog.name}
        value={newComponentName}
        onChange={onNewLayoutNameChange}
      />
    </Stack>
  );

  return (
    <GenericDialog
      cancelButtonText={strings.layoutEditor.addLayoutViewDialog.cancel}
      positiveButtonText={strings.layoutEditor.addLayoutViewDialog.confirm}
      title={strings.layoutEditor.addLayoutViewDialog.title}
      error={false}
      onConfirm={onConfirmClick}
      onCancel={onClose}
      open={open}
      onClose={onCloseOrCancelClick}
      confirmDisabled={!newComponentType}
    >
      {renderDialogContent()}
    </GenericDialog>
  );
};

export default AddNewElementDialog;
