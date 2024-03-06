import createStyles from "@mui/styles/createStyles";

export default createStyles({

  loader: {
    minHeight: 200,
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },

  fileName: {
    wordBreak: "break-all",
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
