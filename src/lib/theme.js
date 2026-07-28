"use client";

import { createTheme } from "@mui/material/styles";

// Palette from the brand swatches
// Brilliance #FCFDFD, Springtime Rain #EDEFF3, Wind Weaver #C6D1D7,
// Wild Thistle #9FA0B5, Soothing Sapphire #2F7EDA, Blackwater #555663
const theme = createTheme({
  cssVariables: true,
  palette: {
    mode: "light",
    primary: {
      main: "#2F7EDA",
      light: "#5B9AE4",
      dark: "#215FA8",
      contrastText: "#FCFDFD",
    },
    secondary: {
      main: "#9FA0B5",
      contrastText: "#FCFDFD",
    },
    background: {
      default: "#EDEFF3",
      paper: "#FCFDFD",
    },
    text: {
      primary: "#555663",
      secondary: "#9FA0B5",
    },
    divider: "#C6D1D7",
    success: { main: "#2E9E6B" },
    warning: { main: "#E0A23B" },
    error: { main: "#D9534F" },
    info: { main: "#2F7EDA" },
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily:
      'var(--font-inter), system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif',
    h4: { fontWeight: 700, letterSpacing: "-0.02em" },
    h5: { fontWeight: 700, letterSpacing: "-0.01em" },
    h6: { fontWeight: 700 },
    subtitle1: { fontWeight: 600 },
    subtitle2: { fontWeight: 600 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: "none" },
      },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          border: "1px solid #E2E7EC",
          borderRadius: 16,
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 10, paddingInline: 18 },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#FCFDFD",
          color: "#555663",
          borderBottom: "1px solid #E2E7EC",
        },
      },
    },
    MuiTextField: {
      defaultProps: { size: "small" },
    },
  },
});

export default theme;
