// theme.js
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#448c74",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#edf1f5",
      contrastText: "#121519",
    },
    success: {
      main: "#3fca90",
      contrastText: "#ffffff",
    },
    info: {
      main: "#3f7fca",
      contrastText: "#ffffff",
    },
    warning: {
      main: "#edcb50",
      contrastText: "#121519",
    },
    error: {
      main: "#ed5050",
      contrastText: "#ffffff",
    },
    background: {
      default: "#ffffff",
      paper: "#edf1f5",
    },
    text: {
      primary: "#576071",
      secondary: "#858c97",
    },
  },
  typography: {
    fontFamily: '"Inter", sans-serif',
  },
  shape: {
    borderRadius: 16,
  },
});

export default theme;
