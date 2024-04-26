import strings from "../../../localization/strings";
import { ComponentProportionName, ComponentProportionType, TreeObject } from "../../../types";
import HtmlComponentsUtils from "../../../utils/html-components-utils";
import LocalizationUtils from "../../../utils/localization-utils";
import ConditionalTooltip from "../../generic/v2/conditional-tooltip";
import SelectBox from "../../generic/v2/select-box";
import TextField from "../../generic/v2/text-field";
import { ExpandOutlined, HeightOutlined } from "@mui/icons-material";
import { MenuItem, Stack, Typography } from "@mui/material";
import { ChangeEvent, useEffect, useState } from "react";

/**
 * Components properties
 */
interface Props {
  component: TreeObject;
  value?: number;
  name: ComponentProportionName;
  label: string;
  onChange: (name: string, value: string) => void;
}

/**
 * HTML Component proportions editor
 */
const ProportionsEditorHtml = ({ component, value, name, label, onChange }: Props) => {
  const componentCanUsePercentageProportions =
    !HtmlComponentsUtils.COMPONENTS_WITHOUT_PERCENTAGE_PROPORTIONS.includes(component.type);

  /**
   * Returns whether component currently has this dimension set to auto
   *
   * @returns boolean
   */
  const getAutoValue = () => {
    const { element } = component;
    const styles = HtmlComponentsUtils.parseStyles(element);

    return styles[name] === "auto";
  };

  /**
   * Gets element proportion type
   *
   * @param proportion proportion
   */
  const getElementProportionType = (proportion: ComponentProportionName) => {
    const styles = HtmlComponentsUtils.parseStyles(component.element);
    const elementDimension = styles[proportion];

    if (elementDimension === "auto") return "auto";

    if (!componentCanUsePercentageProportions) return "px";

    if (elementDimension?.endsWith("%")) return "%";
    if (elementDimension?.endsWith("px")) return "px";
    return "px";
  };

  const [proportionType, setProportionType] = useState<ComponentProportionType>(
    getElementProportionType(name)
  );

  useEffect(() => {
    setProportionType(getElementProportionType(name));
  }, [component]);

  /**
   * Event handler for select box change events
   *
   * @param event event
   */
  const onSettingsChange = ({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
    setProportionType(value as ComponentProportionType);
    if (value === "auto") {
      onChange(name, "auto");
      return;
    }
    const styles = HtmlComponentsUtils.parseStyles(component.element);
    const val = styles[name];
    const numberVal = parseInt(val.replace("auto", "0"));

    onChange(name, `${numberVal}${value}`);
  };

  /**
   * Event handler for input change events
   *
   * @param event event
   */
  const onValueChange = ({ target: { name, value } }: ChangeEvent<HTMLInputElement>) => {
    // Strip all non-numeric characters as they are not allowed
    const val = `${value.replace(/\D/g, "")}${proportionType}`;

    onChange(name, val);
  };

  /**
   * Renders icon
   */
  const renderIcon = () => {
    const iconStyles = {
      color: "#2196F3",
      border: "1px solid #2196F3",
      borderRadius: "5px"
    };
    switch (name) {
      case "width":
        return (
          <HeightOutlined
            sx={{
              transform: "rotate(90deg)",
              ...iconStyles
            }}
          />
        );
      case "height":
        return <ExpandOutlined sx={{ ...iconStyles }} />;
    }
  };

  /**
   * Parses the value to be displayed in the input field
   *
   * If the value is undefined and the proportion type is not auto, return 0
   * If the elements proportion type is auto, return an empty string to be displayed in the input field
   */
  const parseValue = () => {
    if (value === undefined && proportionType !== "auto") {
      return 0;
    }

    return value ?? "";
  };

  /**
   * Returns tooltip text
   */
  const getTooltipText = () =>
    strings.formatString(
      strings.layoutEditorV2.genericProperties.proportionSetToAuto,
      LocalizationUtils.getLocalizedComponentProportionName(name)
    );

  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Typography variant="caption" fontWeight={500} fontSize="12px">
        {label}
      </Typography>
      <ConditionalTooltip title={getTooltipText()} enabled={getAutoValue()}>
        <TextField
          name={name}
          value={parseValue()}
          onChange={onValueChange}
          disabled={getAutoValue()}
        />
      </ConditionalTooltip>
      <SelectBox value={proportionType} onChange={onSettingsChange}>
        <MenuItem value="px" sx={{ color: "#2196F3" }}>
          px
        </MenuItem>
        {componentCanUsePercentageProportions && (
          <MenuItem value="%" sx={{ color: "#2196F3" }}>
            %
          </MenuItem>
        )}
        <MenuItem value="auto" sx={{ color: "#2196F3" }}>
          auto
        </MenuItem>
      </SelectBox>
      {renderIcon()}
    </Stack>
  );
};

export default ProportionsEditorHtml;
