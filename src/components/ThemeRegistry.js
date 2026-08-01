"use client";

import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import GlobalStyles from "@mui/material/GlobalStyles";
import theme from "@/lib/theme";

const keyframes = (
  <GlobalStyles
    styles={{
      "@keyframes floaty": {
        "0%,100%": { transform: "translateY(0)" },
        "50%": { transform: "translateY(-14px)" },
      },
      "@keyframes floatySlow": {
        "0%,100%": { transform: "translateY(0) rotate(0deg)" },
        "50%": { transform: "translateY(-22px) rotate(1.5deg)" },
      },
      "@keyframes gradientShift": {
        "0%,100%": { backgroundPosition: "0% 50%" },
        "50%": { backgroundPosition: "100% 50%" },
      },
      "@keyframes marquee": {
        "0%": { transform: "translateX(0)" },
        "100%": { transform: "translateX(-50%)" },
      },
      "@keyframes fadeUp": {
        from: { opacity: 0, transform: "translateY(24px)" },
        to: { opacity: 1, transform: "translateY(0)" },
      },
      "@keyframes pulseGlow": {
        "0%,100%": { boxShadow: "0 0 0 0 rgba(47,126,218,0.35)" },
        "50%": { boxShadow: "0 0 0 14px rgba(47,126,218,0)" },
      },
      "@keyframes shimmer": {
        "0%": { backgroundPosition: "-450px 0" },
        "100%": { backgroundPosition: "450px 0" },
      },
      "@keyframes spinSlow": {
        to: { transform: "rotate(360deg)" },
      },
    }}
  />
);

export default function ThemeRegistry({ children }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {keyframes}
      {children}
    </ThemeProvider>
  );
}
