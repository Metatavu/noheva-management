import GenericUtils from "../../../utils/generic-utils";
import { Popover } from "@mui/material";
import { Color, ColorResult, SketchPicker } from "react-color";
import { PresetColor } from "react-color/lib/components/sketch/Sketch";

/**
 * Components properties
 */
interface Props {
  color?: Color;
  anchorEl?: HTMLButtonElement;
  popover?: boolean;
  onClose?: () => void;
  onChangeComplete: (color: ColorResult) => void;
}

/**
 * Color Picker component
 */
const ColorPicker = ({ color, anchorEl, popover, onClose, onChangeComplete }: Props) => {
  /**
   * Gets preset colors from local storage
   */
  const getPresetColors = () =>
    GenericUtils.distinctArray(
      JSON.parse(localStorage.getItem("presetColors") || "[]")
    ) as PresetColor[];

  /**
   * Sets color to local storage as preset
   *
   * @param color Color to set as preset
   */
  const setPresetColor = (color: string) => {
    const presetColors = getPresetColors();
    presetColors.splice(0, 0, color);
    localStorage.setItem(
      "presetColors",
      JSON.stringify(GenericUtils.distinctArray(presetColors.slice(0, 14)))
    );
  };

  /**
   * Event handler for color change
   *
   * @param color Color result
   */
  const handleChangeComplete = (color: ColorResult) => {
    setPresetColor(color.hex);
    onChangeComplete(color);
  };

  if (anchorEl && popover) {
    return (
      <Popover
        open={!!anchorEl}
        anchorEl={anchorEl}
        onClose={onClose}
        anchorOrigin={{
          vertical: "center",
          horizontal: "left"
        }}
        transformOrigin={{
          vertical: "center",
          horizontal: "right"
        }}
      >
        <SketchPicker
          color={color}
          presetColors={getPresetColors()}
          onChangeComplete={handleChangeComplete}
        />
      </Popover>
    );
  }

  if (!popover) {
    return (
      <SketchPicker
        color={color}
        presetColors={getPresetColors()}
        onChangeComplete={handleChangeComplete}
      />
    );
  }

  return null;
};

export default ColorPicker;
