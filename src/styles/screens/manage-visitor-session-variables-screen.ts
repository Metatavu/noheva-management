import theme from "../theme";
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

  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-around",
    flexDirection: "column",
    backgroundColor: "#F5EFEA",
    overflow: "auto"
  },

  logoContainer: {
    flex: 1,
    marginTop: theme.spacing(10),
    marginBottom: theme.spacing(5),
    width: 200,
    height: 200,
    "& img": {
      width: "100%"
    }
  },

  editorLayout: {
    overflow: "hidden",
    height: "100%",
    display: "grid",
    gridTemplateRows: "1fr",
    gridTemplateColumns: "auto 1fr auto",
    gridTemplateAreas: ' "navigation editor-view properties" '
  },

  sessionListContainer: {
    padding: "0 25%",
    height: "100%"
  },

  sessionList: {
    borderLeft: "1px solid #00000011",
    borderRight: "1px solid #00000011",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
  },

  editorContainer: {
    padding: theme.spacing(4)
  },

  variableTitle: {
    marginBottom: theme.spacing(2)
  },

  variableValue: {
    marginBottom: theme.spacing(2)
  }
});
