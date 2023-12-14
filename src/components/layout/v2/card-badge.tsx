import { Badge } from "@mui/material";
import { ReactNode } from "react";
import theme from "../../../styles/theme";

/**
 * Components properties
 */
interface Props {
  badgeContent?: ReactNode;
  children: ReactNode;
}

/**
 * Layout Card Badge component
 */
const CardBadge = ({ badgeContent, children }: Props) => {
  return (
    <Badge
      sx={{ position: "relative" }}
      slotProps={{ badge: { style: { zIndex: theme.zIndex.modal - 1 } } }}
      badgeContent={badgeContent}
    >
      {children}
    </Badge>
  );
};

export default CardBadge;
