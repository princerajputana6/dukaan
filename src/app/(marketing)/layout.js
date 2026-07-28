import { Box } from "@mui/material";
import MarketingHeader from "@/components/marketing/MarketingHeader";
import MarketingFooter from "@/components/marketing/MarketingFooter";

export default function MarketingLayout({ children }) {
  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", bgcolor: "background.paper" }}>
      <MarketingHeader />
      <Box component="main" sx={{ flex: 1 }}>
        {children}
      </Box>
      <MarketingFooter />
    </Box>
  );
}
