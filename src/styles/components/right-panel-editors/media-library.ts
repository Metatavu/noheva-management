import theme from "../../theme";
import createStyles from "@mui/styles/createStyles";

export default createStyles({

  loader: {
    height: "100%",
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },

  fileName: {
    whiteSpace: 'nowrap', 
    overflow: 'hidden', 
    textOverflow: 'ellipsis', 
    width: "100%",
    display: "block"
  },

  accordionDetails: {
    padding: 0
  },

  activeListItem: {
    backgroundColor: "rgba(0, 121, 233, 0.25)"
  }
});
