import Link from "next/link";
import { Box, Container, Grid, Typography, Stack } from "@mui/material";
import Logo from "@/components/Logo";

const COLUMNS = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/#features" },
      { label: "Pricing", href: "/#pricing" },
      { label: "Request Access", href: "/request-account" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Refund Policy", href: "/refund-policy" },
    ],
  },
];

export default function MarketingFooter() {
  return (
    <Box component="footer" sx={{ bgcolor: "#555663", color: "#EDEFF3", mt: 8 }}>
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Box sx={{ mb: 2 }}>
              <Logo height={30} />
            </Box>
            <Typography variant="body2" sx={{ color: "#C6D1D7", maxWidth: 300 }}>
              Modern inventory and point-of-sale software for pan, cigarette and retail
              shops across India.
            </Typography>
          </Grid>
          {COLUMNS.map((col) => (
            <Grid item xs={6} md={2.66} key={col.title}>
              <Typography variant="subtitle2" sx={{ mb: 1.5, color: "#FCFDFD" }}>
                {col.title}
              </Typography>
              <Stack spacing={1}>
                {col.links.map((l) => (
                  <Typography
                    key={l.href}
                    component={Link}
                    href={l.href}
                    variant="body2"
                    sx={{ color: "#C6D1D7", textDecoration: "none", "&:hover": { color: "#FCFDFD" } }}
                  >
                    {l.label}
                  </Typography>
                ))}
              </Stack>
            </Grid>
          ))}
        </Grid>
        <Box sx={{ borderTop: "1px solid rgba(255,255,255,0.12)", mt: 5, pt: 3 }}>
          <Typography variant="caption" sx={{ color: "#9FA0B5" }}>
            © {new Date().getFullYear()} Dukaan. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
