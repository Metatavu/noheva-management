import strings from "../../localization/strings";
import Box from '@mui/material/Box';
import Typography from "@mui/material/Typography";
import * as React from "react";
import { useState } from "react";
import { MultiLingualContentVersion } from "../../types";
import { ContentVersionActiveCondition, ExhibitionDeviceGroup, VisitorVariable, VisitorVariableType } from "../../generated/client";
import GenericDialog from "../generic/generic-dialog";
import { ClassNameMap, FormControl, MenuItem, TextField, TextFieldProps } from "@mui/material";
import WithDebounce from "../generic/with-debounce";
import theme from "../../styles/theme";

/**
 * Component props
 */
interface Props {
  multiLingualContentVersion: MultiLingualContentVersion;
  visitorVariables?: VisitorVariable[];
  deviceGroups: ExhibitionDeviceGroup[];
  dialogOpen: boolean;
  classes: ClassNameMap;
  isExistingName: (name: string) => boolean;
  onSaveClick: (multiLingualContentVersion: MultiLingualContentVersion) => Promise<void>;
  onCloseClick: () => void;
}

/**
 * Media library component 
 */
const ContentVersionEditDialog: React.FC<Props> = ({ 
  multiLingualContentVersion,
  visitorVariables,
  deviceGroups,
  dialogOpen,
  classes,
  isExistingName,
  onSaveClick,
  onCloseClick
}) => {
  const [ formError, setFormError ] = useState<string>();
  const [ updatedMultiLingualContentVersion, setUpdatedMultiLingualContentVersion ] = useState<MultiLingualContentVersion>(multiLingualContentVersion);

  /**
   * Event handler for name change
   *
   * @param event react change event
   */
  const onNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    if (value === "") {
      setFormError(strings.contentVersion.nameIsMandatory);
      return;
    }

    if (value !== multiLingualContentVersion.languageVersions[0].name && isExistingName(value)) {
      setFormError(strings.contentVersion.nameAlreadyTaken);
      return;
    }
    
    setFormError(undefined);
    setUpdatedMultiLingualContentVersion({
      ...updatedMultiLingualContentVersion,
      languageVersions: updatedMultiLingualContentVersion.languageVersions.map(languageVersion => {
        return {
          ...languageVersion,
          name: value
        };
      })
    });
  };

  /**
   * Event handler for active condition select change
   *
   * @param event react change event
   */
  const onActiveConditionSelectChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { value } = event.target;

    const newActiveCondition: ContentVersionActiveCondition = {
      userVariable: value,
      equals: ""
    };

    setUpdatedMultiLingualContentVersion({
      ...updatedMultiLingualContentVersion,
      languageVersions: updatedMultiLingualContentVersion.languageVersions.map(languageVersion => {
        return {
          ...languageVersion,
          activeCondition: newActiveCondition
        };
      })
    });
  };

  /**
   * Event handler for active condition select change
   *
   * @param event react change event
   */
  const onActiveConditionValueChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;

    const newActiveCondition: ContentVersionActiveCondition = {
      userVariable: value,
      [name]: value
    };

    setUpdatedMultiLingualContentVersion({
      ...updatedMultiLingualContentVersion,
      languageVersions: updatedMultiLingualContentVersion.languageVersions.map(languageVersion => {
        return {
          ...languageVersion,
          activeCondition: newActiveCondition
        };
      })
    });
  };

  /**
   * Event handler for dialog save click
   */
  const onDialogSaveClick = async () => {
    await onSaveClick(updatedMultiLingualContentVersion);
  }

  /**
   * Renders variables
   *
   * @param visitorVariable visitor variables
   * @param value current value
   */
  const renderVariables = (visitorVariable: VisitorVariable, value?: string) => {
    const textFieldProps: TextFieldProps = {
      className: classes.field,
      fullWidth: true,
      label: strings.exhibition.resources.dynamic.equals,
      name: "equals",
      value: value,
      onChange: onActiveConditionValueChange
    };

    switch (visitorVariable.type) {
      case VisitorVariableType.Enumerated:
        return (
          <TextField {...textFieldProps} select>
            {visitorVariable._enum?.map((value, index) => (
              <MenuItem key={index} value={value}>
                {value}
              </MenuItem>
            ))}
          </TextField>
        );
      case VisitorVariableType.Boolean:
        return (
          <TextField {...textFieldProps} select>
            <MenuItem key="true" value="true">
              {strings.visitorVariables.booleanValues.true}
            </MenuItem>
            <MenuItem key="false" value="false">
              {strings.visitorVariables.booleanValues.false}
            </MenuItem>
          </TextField>
        );
      case VisitorVariableType.Number:
        return <TextField {...textFieldProps} type="number" />;
      default:
        return <TextField {...textFieldProps} />;
    }
  };

  /**
   * Renders activity condition options
   */
  const renderActivityCondition = () => {
    const activeCondition = updatedMultiLingualContentVersion?.languageVersions[0]?.activeCondition;

    const label = activeCondition?.userVariable
      ? strings.exhibition.resources.dynamic.key
      : strings.generic.noSelection;
    return (
      <>
        <Box mt={2} mb={2}>
          <Typography variant="body1">{strings.contentVersion.contentIsActiveWhen}</Typography>
        </Box>
        <TextField
          fullWidth
          name="userVariable"
          label={ label }
          select
          value={ activeCondition?.userVariable || "" }
          onChange={ onActiveConditionSelectChange }
        >
          {visitorVariables?.map((variable) => (
            <MenuItem key={variable.id} value={variable.name}>
              {variable.name}
            </MenuItem>
          ))}
          {
            <MenuItem key={"no-value"} value={""}>
              {strings.generic.noSelection}
            </MenuItem>
          }
        </TextField>
        {activeCondition?.userVariable && (
          <>
            <Box mt={2} mb={2}>
              <Typography variant="body1">{strings.contentVersion.equals}</Typography>
            </Box>
            {visitorVariables
              ?.filter((variable) => variable.name === activeCondition?.userVariable)
              .map((variable) => {
                renderVariables(variable, activeCondition?.equals);
              })}
          </>
        )}
      </>
    );
  };

  if (!updatedMultiLingualContentVersion) {
    return null;
  }

  return (
    <GenericDialog
      cancelButtonText={strings.genericDialog.cancel}
      positiveButtonText={strings.genericDialog.save}
      title={strings.contentVersion.addDialogTitle}
      error={!!formError}
      onConfirm={ onDialogSaveClick }
      onCancel={ onCloseClick }
      open={ dialogOpen }
      onClose={ onCloseClick }
      confirmDisabled={ formError !== undefined }
    >
      <Box width={320}>
        {formError && (
          <Typography variant="body1" color="error" style={{ marginBottom: theme.spacing(1) }}>
            {formError}
          </Typography>
        )}
        <Box mb={2}>
          <Typography variant="body1">{strings.contentVersion.addDialogDescription}</Typography>
        </Box>
        <FormControl fullWidth>
          <WithDebounce
            name="name"
            label={ strings.contentVersion.name }
            value={ updatedMultiLingualContentVersion?.languageVersions[0].name || "" }
            onChange={ onNameChange }
            debounceTimeout={250}
            component={(props) => <TextField {...props} />}
          />
        </FormControl>
        <FormControl sx={{ marginTop: theme.spacing(1) }} fullWidth>
          <TextField
            fullWidth
            select
            name="deviceGroupId"
            label={strings.contentVersion.deviceGroup}
            value={ updatedMultiLingualContentVersion.languageVersions[0].deviceGroupId || ""}
            onChange={(event) => {
              setUpdatedMultiLingualContentVersion({
                ...updatedMultiLingualContentVersion,
                languageVersions: updatedMultiLingualContentVersion.languageVersions.map(languageVersion => {
                  return {
                    ...languageVersion,
                    deviceGroupId: event.target.value as string
                  };
                })
              });
            }}
          >
            {
              deviceGroups?.map((deviceGroup) => (
                <MenuItem key={deviceGroup.id} value={deviceGroup.id}>
                  {deviceGroup.name}
                </MenuItem>
              ))
            }
          </TextField>
        </FormControl>
        { renderActivityCondition() }
      </Box>
    </GenericDialog>
  );
};

export default ContentVersionEditDialog;