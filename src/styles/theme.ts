import { createTheme } from "@mui/material";
import { grey, red } from "@mui/material/colors";

const theme = createTheme();
const { spacing } = theme;

const uiHighlightMain = "#0079E9";
const uiHighlightLight = "rgba(0, 121, 233, 0.25)";

export default createTheme({
  palette: {
    primary: { main: grey[900] },
    secondary: {
      main: uiHighlightMain,
      light: uiHighlightLight
    },
    background: {
      default: "#f2f2f2",
      paper: "#fff"
    },
    text: {
      primary: "#000",
      secondary: "#222"
    },
    error: red
  },

  typography: {
    fontFamily: "TTNorms-Regular",
    h1: {
      fontFamily: "TTNorms-Bold",
      fontSize: "24px",
      fontWeight: "normal"
    },
    h2: {
      fontFamily: "TTNorms-Bold",
      fontSize: "20px",
      fontWeight: "normal"
    },
    h3: {
      fontFamily: "TTNorms-Bold",
      fontSize: "18px",
      fontWeight: "normal"
    },
    h4: {
      fontFamily: "TTNorms-Bold",
      fontSize: "16px",
      fontWeight: "normal"
    },
    h5: {
      fontFamily: "TTNorms-Medium",
      fontSize: "16px",
      fontWeight: "normal"
    },
    h6: {
      fontFamily: "TTNorms-Regular",
      fontSize: "14px",
      fontWeight: "normal",
      color: "#666666"
    },
    body1: {
      fontSize: "14px"
    },
    body2: {
      fontSize: "14px",
      fontFamily: "TTNorms-Bold"
    }
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        "@global": {
          "::-webkit-scrollbar-track": {
            backgroundColor: theme.palette.grey[300]
          },
          "::-webkit-scrollbar": {
            height: 10,
            width: 8
          },
          "::-webkit-scrollbar-thumb": {
            backgroundColor: theme.palette.text.secondary,
            border: "none",
            borderRadius: 30
          }
        }
      }
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          cursor: "pointer",
          transition: "background 0.2s ease-out",
          "&.Mui-selected": {
            backgroundColor: "rgba(0, 121, 233, 0.25)"
          },
          "&:hover": {
            backgroundColor: "rgba(0, 121, 233, 0.15)"
          }
        }
      }
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          fontFamily: "TTNorms-Regular",
          padding: 10
        },
        head: {
          fontFamily: "TTNorms-Bold",
          backgroundColor: "#efefef"
        }
      }
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          "&.Mui-expanded": {
            margin: 0
          },
          "&:before": {
            backgroundColor: "rgba(0,0,0,0)"
          }
        }
      },
      defaultProps: {
        elevation: 0
      }
    },
    MuiAccordionSummary: {
      styleOverrides: {
        root: {
          backgroundColor: "#eaeaea",
          padding: "0 12px",
          flexDirection: "row-reverse",
          "&.Mui-expanded": {
            minHeight: 48
          }
        },
        content: {
          alignItems: "center",
          justifyContent: "space-between",
          "&.Mui-expanded": {
            margin: "12px 0"
          }
        },
        expandIconWrapper: {
          "&.Mui-expanded": {
            // Note: this only works with ChevronRight icon - use default setting when using ExpandMore icon
            transform: "rotate(90deg)"
          }
        }
      }
    },
    MuiAccordionDetails: {
      styleOverrides: {
        root: {
          flexDirection: "column",
          padding: spacing(2),
          backgroundColor: "#f7f7f7"
        }
      }
    },
    MuiBackdrop: {
      styleOverrides: {
        root: {
          backgroundColor: "rgba(0,0,0,0.1)"
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: 10
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          fontFamily: "TTNorms-Medium",
          textTransform: "initial"
        },
        text: {
          fontFamily: "TTNorms-Bold"
        },
        textPrimary: {
          fontFamily: "TTNorms-Medium"
        },
        containedPrimary: {
          color: "#fff",
          textTransform: "initial",
          borderRadius: 0
        },
        containedSecondary: {
          color: "#fff",
          textTransform: "initial",
          borderRadius: 0
        },
        contained: {
          color: "#fff",
          backgroundColor: uiHighlightMain,
          textTransform: "initial",
          borderRadius: 0,
          "&:hover": {
            backgroundColor: "rgba(138,192,203, 0.8)"
          },
          "&:active": {
            backgroundColor: "rgba(138,192,203, 0.7)"
          }
        }
      }
    },
    MuiInputLabel: {
      styleOverrides: {
        filled: {
          transform: "translate(12px, 13px) scale(1)",
          "&.MuiInputLabel-shrink": {
            transform: "translate(0px, -16px) scale(0.9)"
          }
        }
      }
    },
    MuiFilledInput: {
      styleOverrides: {
        root: {
          backgroundColor: "#f3f3f3",
          borderRadius: 4,
          "& .MuiSelect-select": {
            color: "#222"
          }
        },
        input: {
          padding: "10px 12px"
        },
        multiline: {
          paddingTop: 10
        },
        underline: {
          "&::before": {
            borderBottom: "0px solid rgba(0,0,0,0)"
          },
          "&::after": {
            borderBottomColor: uiHighlightMain
          },
          "&:hover": {
            "&::before": {
              borderBottomColor: uiHighlightMain
            }
          }
        }
      }
    },
    MuiInput: {
      styleOverrides: {
        underline: {
          "&::before": {
            content: "none"
          }
        }
      }
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          fontSize: 14
        },
        input: {
          background: "#fff"
        }
      }
    },
    MuiSelect: {
      styleOverrides: {
        filled: {
          padding: "10px 12px"
        },
        outlined: {
          padding: "18.5px 14px"
        },
        select: {
          lineHeight: 1,
          padding: 5,
          color: "#999"
        },
        icon: {
          color: "#999"
        }
      },
      defaultProps: {
        fullWidth: true,
        variant: "outlined"
      }
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          cursor: "pointer",
          borderRadius: 4,
          "&.selectable": {
            "&:hover": {
              backgroundColor: "rgba(0,0,0,0.1)"
            }
          },
          "&.Mui-selected": {
            backgroundColor: "rgba(0,0,0,0)",
            color: uiHighlightMain,
            "& .MuiListItemIcon-root": {
              color: "#fff",
              backgroundColor: uiHighlightMain
            },
            "& .MuiTypography-colorTextSecondary": {
              color: uiHighlightMain
            }
          }
        }
      }
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          height: 30,
          width: 30,
          justifyContent: "center",
          alignItems: "center",
          borderRadius: "50%",
          minWidth: 24,
          marginRight: 15,
          transition: "background-color 0.2s ease-out",
          "& .MuiSvgIcon-root": {
            fontSize: 16
          }
        }
      }
    },
    MuiListItemText: {
      styleOverrides: {
        primary: {
          fontFamily: "TTNorms-Medium",
          fontSize: "14px"
        },
        secondary: {
          color: "#888"
        }
      }
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontFamily: "TTNorms-Medium",
          fontSize: "16px",
          fontWeight: "normal",
          color: "#000"
        }
      }
    },
    MuiTab: {
      styleOverrides: {
        root: {
          fontWeight: "bold",
          textTransform: "initial"
        }
      }
    },
    MuiTextField: {
      defaultProps: {
        fullWidth: true,
        variant: "outlined"
      }
    },
    MuiFormControl: {
      defaultProps: {
        fullWidth: true,
        variant: "outlined"
      }
    }
  }
});
