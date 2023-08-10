import styles from "../../styles/components/generic/generic-button";
import { Button } from "@mui/material";
import { WithStyles } from "@mui/styles";
import withStyles from "@mui/styles/withStyles";
import * as React from "react";

type CustomColor = "inherit" | "primary" | "secondary" | "success" | "error" | "info" | "warning";

interface Props extends WithStyles<typeof styles> {
  text?: string;
  color?: CustomColor;
  icon?: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
}

const GenericButton: React.FC<Props> = (props: Props) => {
  const { color, ...otherProps } = props;

  const validColor: CustomColor = color || "primary";

  return (
    <Button
      disableElevation
      variant="contained"
      color={validColor}
      {...otherProps}
      startIcon={props.icon}
      className={props.classes.button}
      style={props.style}
    >
      {props.text}
    </Button>
  );
};

export default withStyles(styles)(GenericButton);
