"use client";

import { createTheme } from "@mui/material/styles";

// Brand: Soothing Sapphire #2F7EDA primary, modernised neutrals for a crisp SaaS feel.
export const gradients = {
  brand: "linear-gradient(135deg, #2F7EDA 0%, #4C63E6 100%)",
  brandSoft: "linear-gradient(135deg, rgba(47,126,218,0.12) 0%, rgba(76,99,230,0.12) 100%)",
  hero: "radial-gradient(1200px 600px at 15% -10%, rgba(76,99,230,0.18), transparent 60%), radial-gradient(1000px 500px at 100% 0%, rgba(47,126,218,0.16), transparent 55%)",
  dark: "linear-gradient(135deg, #232A38 0%, #2F7EDA 140%)",
  mesh: "radial-gradient(600px 300px at 20% 20%, rgba(47,126,218,0.25), transparent), radial-gradient(500px 300px at 80% 30%, rgba(124,92,252,0.22), transparent), radial-gradient(500px 400px at 50% 100%, rgba(46,158,107,0.18), transparent)",
};

const theme = createTheme({
  cssVariables: true,
  palette: {
    mode: "light",
    primary: {
      main: "#2F7EDA",
      light: "#5B9AE4",
      dark: "#215FA8",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#7C5CFC",
      contrastText: "#FFFFFF",
    },
    background: {
      default: "#F5F7FB",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#1B2333",
      secondary: "#66707E",
    },
    divider: "#E7ECF3",
    success: { main: "#12A366" },
    warning: { main: "#E0A23B" },
    error: { main: "#E5484D" },
    info: { main: "#2F7EDA" },
  },
  shape: {
    borderRadius: 14,
  },
  typography: {
    fontFamily:
      'var(--font-inter), system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif',
    h1: { fontWeight: 800, letterSpacing: "-0.035em" },
    h2: { fontWeight: 800, letterSpacing: "-0.03em" },
    h3: { fontWeight: 800, letterSpacing: "-0.025em" },
    h4: { fontWeight: 800, letterSpacing: "-0.02em" },
    h5: { fontWeight: 700, letterSpacing: "-0.015em" },
    h6: { fontWeight: 700, letterSpacing: "-0.01em" },
    subtitle1: { fontWeight: 600 },
    subtitle2: { fontWeight: 600 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        "*": { scrollBehavior: "smooth" },
        body: { backgroundColor: "#F5F7FB" },
        "::selection": { background: "rgba(47,126,218,0.18)" },
      },
    },
    MuiPaper: {
      styleOverrides: { root: { backgroundImage: "none" } },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          border: "1px solid #EAEEF4",
          borderRadius: 18,
          boxShadow: "0 1px 2px rgba(16,24,40,0.04), 0 8px 24px rgba(16,24,40,0.04)",
          transition: "transform .25s cubic-bezier(.2,.7,.3,1), box-shadow .25s ease, border-color .25s ease",
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: 12,
          paddingInline: 20,
          paddingBlock: 8,
          transition: "transform .15s ease, box-shadow .2s ease, background .2s ease",
          "&:active": { transform: "translateY(1px)" },
        },
        containedPrimary: {
          background: "linear-gradient(135deg, #3B86E0 0%, #2F7EDA 100%)",
          boxShadow: "0 6px 16px rgba(47,126,218,0.30)",
          "&:hover": { boxShadow: "0 10px 24px rgba(47,126,218,0.40)" },
        },
        sizeLarge: { paddingInline: 26, paddingBlock: 12, fontSize: 16 },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "rgba(255,255,255,0.72)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          color: "#1B2333",
          borderBottom: "1px solid #EAEEF4",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600 },
      },
    },
    MuiTextField: { defaultProps: { size: "small" } },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          transition: "box-shadow .2s ease, border-color .2s ease",
          "&.Mui-focused": { boxShadow: "0 0 0 4px rgba(47,126,218,0.12)" },
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: { borderRadius: 8, fontSize: 12, background: "#1B2333" },
      },
    },
  },
});

export default theme;
