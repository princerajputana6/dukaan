import Link from "next/link";
import {
  Box,
  Container,
  Grid,
  Typography,
  Button,
  Card,
  CardContent,
  Stack,
  Chip,
  Avatar,
  Divider,
} from "@mui/material";
import PointOfSaleRoundedIcon from "@mui/icons-material/PointOfSaleRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import StoreMallDirectoryRoundedIcon from "@mui/icons-material/StoreMallDirectoryRounded";
import GroupRoundedIcon from "@mui/icons-material/GroupRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";

const FEATURES = [
  { icon: <PointOfSaleRoundedIcon />, title: "Fast Point of Sale", desc: "Bill customers in seconds with a tap-to-add POS built for busy counters." },
  { icon: <Inventory2RoundedIcon />, title: "Smart Inventory", desc: "Track every product, price and unit with real-time stock updates on each sale." },
  { icon: <WarningAmberRoundedIcon />, title: "Low-Stock Alerts", desc: "Never run out. Get instant reorder alerts when items fall below your threshold." },
  { icon: <InsightsRoundedIcon />, title: "Sales & Profit Insights", desc: "See daily revenue, profit margins and your best sellers at a glance." },
  { icon: <StoreMallDirectoryRoundedIcon />, title: "Multi-Store Ready", desc: "Run several shops from one account and switch between them instantly." },
  { icon: <GroupRoundedIcon />, title: "Team Roles", desc: "Add store managers with the right access while you stay in control." },
];

const PLANS = [
  { name: "Starter", price: "₹499", period: "/mo", stores: "1 store", features: ["Unlimited products", "POS & billing", "Low-stock alerts", "Sales reports"] },
  { name: "Growth", price: "₹1,299", period: "/mo", stores: "Up to 3 stores", featured: true, features: ["Everything in Starter", "Multiple stores", "Store managers", "Priority support"] },
  { name: "Enterprise", price: "Custom", period: "", stores: "Up to 10 stores", features: ["Everything in Growth", "Dedicated manager", "Custom onboarding", "SLA support"] },
];

export default function LandingPage() {
  return (
    <Box>
      {/* Hero */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #FCFDFD 0%, #EDEFF3 55%, #C6D1D7 100%)",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Container maxWidth="lg" sx={{ py: { xs: 7, md: 12 } }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={7}>
              <Chip
                label="Built for pan, cigarette & retail shops"
                color="primary"
                variant="outlined"
                sx={{ mb: 2.5, bgcolor: "rgba(47,126,218,0.06)" }}
              />
              <Typography
                variant="h2"
                sx={{ fontWeight: 800, letterSpacing: "-0.03em", fontSize: { xs: 38, md: 56 }, lineHeight: 1.05, mb: 2 }}
              >
                Run your shop like a{" "}
                <Box component="span" sx={{ color: "primary.main" }}>
                  pro
                </Box>
              </Typography>
              <Typography variant="h6" sx={{ color: "text.secondary", fontWeight: 400, mb: 4, maxWidth: 520 }}>
                Dukaan is the all-in-one billing and inventory software that keeps your
                counter fast, your stock in check and your profits growing.
              </Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                <Button
                  component={Link}
                  href="/request-account"
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForwardRoundedIcon />}
                >
                  Request Access
                </Button>
                <Button component={Link} href="/login" variant="outlined" size="large">
                  Owner Login
                </Button>
              </Stack>
              <Stack direction="row" spacing={3} sx={{ mt: 4 }} flexWrap="wrap" useFlexGap>
                {["No hardware needed", "Works on any device", "Set up in minutes"].map((t) => (
                  <Stack key={t} direction="row" spacing={0.75} alignItems="center">
                    <CheckCircleRoundedIcon sx={{ color: "success.main", fontSize: 18 }} />
                    <Typography variant="body2" color="text.secondary">
                      {t}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Grid>
            <Grid item xs={12} md={5}>
              <HeroCard />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features */}
      <Container maxWidth="lg" id="features" sx={{ py: { xs: 7, md: 10 } }}>
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Typography variant="overline" color="primary" fontWeight={700}>
            Everything you need
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: "-0.02em", fontSize: { xs: 30, md: 42 } }}>
            One app to run the whole counter
          </Typography>
        </Box>
        <Grid container spacing={2.5}>
          {FEATURES.map((f) => (
            <Grid item xs={12} sm={6} md={4} key={f.title}>
              <Card sx={{ height: "100%" }}>
                <CardContent sx={{ p: 3 }}>
                  <Avatar variant="rounded" sx={{ bgcolor: "rgba(47,126,218,0.10)", color: "primary.main", width: 48, height: 48, mb: 2 }}>
                    {f.icon}
                  </Avatar>
                  <Typography variant="h6" sx={{ mb: 0.5 }}>
                    {f.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {f.desc}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Pricing */}
      <Box sx={{ bgcolor: "background.default", borderTop: "1px solid", borderBottom: "1px solid", borderColor: "divider" }}>
        <Container maxWidth="lg" id="pricing" sx={{ py: { xs: 7, md: 10 } }}>
          <Box sx={{ textAlign: "center", mb: 6 }}>
            <Typography variant="overline" color="primary" fontWeight={700}>
              Simple pricing
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: "-0.02em", fontSize: { xs: 30, md: 42 } }}>
              Plans that grow with you
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              Start with one shop. Add more stores anytime with a quick upgrade.
            </Typography>
          </Box>
          <Grid container spacing={2.5} justifyContent="center">
            {PLANS.map((p) => (
              <Grid item xs={12} sm={6} md={4} key={p.name}>
                <Card
                  sx={{
                    height: "100%",
                    position: "relative",
                    borderColor: p.featured ? "primary.main" : "divider",
                    borderWidth: p.featured ? 2 : 1,
                    boxShadow: p.featured ? "0 16px 40px rgba(47,126,218,0.16)" : "none",
                  }}
                >
                  {p.featured && (
                    <Chip
                      label="Most Popular"
                      color="primary"
                      size="small"
                      sx={{ position: "absolute", top: 16, right: 16 }}
                    />
                  )}
                  <CardContent sx={{ p: 3.5 }}>
                    <Typography variant="h6">{p.name}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {p.stores}
                    </Typography>
                    <Stack direction="row" alignItems="baseline" spacing={0.5} sx={{ mb: 2.5 }}>
                      <Typography variant="h4" fontWeight={800}>
                        {p.price}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {p.period}
                      </Typography>
                    </Stack>
                    <Divider sx={{ mb: 2 }} />
                    <Stack spacing={1.25} sx={{ mb: 3 }}>
                      {p.features.map((f) => (
                        <Stack key={f} direction="row" spacing={1} alignItems="center">
                          <CheckCircleRoundedIcon sx={{ color: "success.main", fontSize: 18 }} />
                          <Typography variant="body2">{f}</Typography>
                        </Stack>
                      ))}
                    </Stack>
                    <Button
                      component={Link}
                      href="/request-account"
                      variant={p.featured ? "contained" : "outlined"}
                      fullWidth
                    >
                      Get Started
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA */}
      <Container maxWidth="lg" sx={{ py: { xs: 7, md: 10 } }}>
        <Card sx={{ bgcolor: "primary.main", color: "#fff", overflow: "hidden" }}>
          <CardContent sx={{ p: { xs: 4, md: 7 }, textAlign: "center" }}>
            <Typography variant="h3" sx={{ fontWeight: 800, fontSize: { xs: 28, md: 40 }, mb: 1.5 }}>
              Ready to modernise your shop?
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 400, opacity: 0.9, mb: 4, maxWidth: 560, mx: "auto" }}>
              Tell us about your business and we&apos;ll set up your account and hand you
              the keys.
            </Typography>
            <Button
              component={Link}
              href="/request-account"
              size="large"
              sx={{ bgcolor: "#fff", color: "primary.main", "&:hover": { bgcolor: "#EDEFF3" } }}
              endIcon={<ArrowForwardRoundedIcon />}
            >
              Request Your Account
            </Button>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

function HeroCard() {
  return (
    <Card sx={{ boxShadow: "0 24px 64px rgba(85,86,99,0.18)", overflow: "hidden" }}>
      <Box sx={{ bgcolor: "#555663", px: 2.5, py: 1.75, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Typography variant="subtitle2" sx={{ color: "#fff" }}>
          Today&apos;s Summary
        </Typography>
        <Chip size="small" label="Live" sx={{ bgcolor: "success.main", color: "#fff" }} />
      </Box>
      <CardContent sx={{ p: 3 }}>
        <Grid container spacing={2}>
          {[
            { label: "Revenue", value: "₹12,480", color: "primary.main" },
            { label: "Profit", value: "₹3,120", color: "success.main" },
            { label: "Orders", value: "86", color: "text.primary" },
            { label: "Low Stock", value: "4", color: "warning.main" },
          ].map((s) => (
            <Grid item xs={6} key={s.label}>
              <Box sx={{ p: 1.75, borderRadius: 2, bgcolor: "background.default", border: "1px solid", borderColor: "divider" }}>
                <Typography variant="caption" color="text.secondary">
                  {s.label}
                </Typography>
                <Typography variant="h6" sx={{ color: s.color, fontWeight: 800 }}>
                  {s.value}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
        <Box sx={{ mt: 2 }}>
          {[
            { n: "Gold Flake Kings", q: "24 sold", v: "₹8,160" },
            { n: "Coca Cola 750ml", q: "31 sold", v: "₹1,395" },
            { n: "Rajnigandha", q: "48 sold", v: "₹480" },
          ].map((r, i) => (
            <Box
              key={r.n}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                py: 1.25,
                borderTop: i === 0 ? "none" : "1px solid",
                borderColor: "divider",
              }}
            >
              <Box>
                <Typography variant="body2" fontWeight={600}>
                  {r.n}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {r.q}
                </Typography>
              </Box>
              <Typography variant="body2" fontWeight={700}>
                {r.v}
              </Typography>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}
