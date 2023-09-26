import theme from "../../../styles/theme";
import { GroupedInputsType } from "../../../types";
import LocalizationUtils from "../../../utils/localization-utils";
import { LinkRounded } from "@mui/icons-material";
import { IconButton, Stack, TextField, Tooltip } from "@mui/material";
import { ChangeEvent, useState } from "react";

/**
 * Component props
 */
interface Props {
  type: GroupedInputsType;
  onChange: (name: string, value: string) => void;
  styles: CSSStyleDeclaration;
}

/**
 * Margin/Padding Editor component
 */
const GroupedInputsWithLock = ({ type, onChange, styles }: Props) => {
  const [lock, setLock] = useState(false);

  const paddingAndMarginSuffixes = ["-top", "-right", "-bottom", "-left"];
  const borderRadiiSuffixes = ["-top-left", "-top-right", "-bottom-right", "-bottom-left"];

  /**
   * Event handler for input change events
   *
   * @param event event
   */
  const onValueChange = ({ target: { name, value } }: ChangeEvent<HTMLInputElement>) =>
    onChange(name, value);

  /**
   * Event handler for linked input change events
   *
   * @param event event
   */
  const onLinkedValueChange = ({ target: { value } }: ChangeEvent<HTMLInputElement>) =>
    onChange(type, value);

  const suffixes =
    type === GroupedInputsType.BORDER_RADIUS ? borderRadiiSuffixes : paddingAndMarginSuffixes;

  /**
   * Gets correct format for CSS border radius
   *
   * @param type grouped input type enum
   * @param suffix string
   */
  const formatBorderRadiusCSSProperty = (type: string, suffix: string) =>
    type.replace("-", `${suffix}-`);

  return (
    <Stack direction="row" spacing={theme.spacing(2)}>
      {suffixes.map((suffix) => {
        const name =
          type === GroupedInputsType.BORDER_RADIUS
            ? formatBorderRadiusCSSProperty(type, suffix)
            : `${type}${suffix}`;

        return (
          <Tooltip
            key={type + suffix}
            title={
              type === GroupedInputsType.BORDER_RADIUS
                ? LocalizationUtils.getLocalizedBorderRadiusTooltip(suffix)
                : LocalizationUtils.getLocalizedMarginPaddingTooltip(suffix)
            }
            placement="top"
          >
            <TextField
              value={parseInt(styles[name as any] || "0").toString()}
              name={name}
              inputProps={{
                pattern: "[0-9]"
              }}
              InputProps={{
                sx: {
                  "& .MuiInputBase-input": {
                    color: "#2196F3",
                    height: "20px",
                    padding: `0 0 0 ${theme.spacing(1)}`
                  }
                }
              }}
              sx={{ width: "34px" }}
              onChange={lock ? onLinkedValueChange : onValueChange}
            />
          </Tooltip>
        );
      })}
      <IconButton sx={{ margin: 0, padding: 0 }} onClick={() => setLock(!lock)}>
        <LinkRounded
          sx={{
            color: lock ? "#ffffff" : "#2196F3",
            backgroundColor: lock ? "#2196F3" : undefined,
            border: "1px solid #2196F3",
            borderRadius: "5px",
            height: "20px"
          }}
        />
      </IconButton>
    </Stack>
  );
};

export default GroupedInputsWithLock;