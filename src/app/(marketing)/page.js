"use client";

import { useState } from "react";
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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tabs,
  Tab,
} from "@mui/material";
import PointOfSaleRoundedIcon from "@mui/icons-material/PointOfSaleRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import StoreMallDirectoryRoundedIcon from "@mui/icons-material/StoreMallDirectoryRounded";
import GroupRoundedIcon from "@mui/icons-material/GroupRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import QrCodeScannerRoundedIcon from "@mui/icons-material/QrCodeScannerRounded";
import RestaurantRoundedIcon from "@mui/icons-material/RestaurantRounded";
import LocalConvenienceStoreRoundedIcon from "@mui/icons-material/LocalConvenienceStoreRounded";
import SmokingRoomsRoundedIcon from "@mui/icons-material/SmokingRoomsRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import Reveal from "@/components/Reveal";
import Counter from "@/components/Counter";
import { gradients } from "@/lib/theme";

const FEATURES = [
  { icon: <PointOfSaleRoundedIcon />, title: "Lightning-fast POS", desc: "Bill customers in seconds with a tap-to-add counter and barcode scanning built for rush hours." },
  { icon: <Inventory2RoundedIcon />, title: "Smart inventory", desc: "Live stock that updates on every sale, with cost, price and units tracked per item." },
  { icon: <WarningAmberRoundedIcon />, title: "Low-stock alerts", desc: "Never run out — automatic reorder alerts the moment items dip below your threshold." },
  { icon: <ReceiptLongRoundedIcon />, title: "GST bills & printing", desc: "Tax-inclusive receipts with CGST/SGST, thermal printing and one-tap WhatsApp PDF." },
  { icon: <InsightsRoundedIcon />, title: "AI Smart Insights", desc: "Daily plain-English guidance on what to restock, what's trending and where you're leaking money." },
  { icon: <StoreMallDirectoryRoundedIcon />, title: "Multi-store control", desc: "Run every outlet from one login and switch between them instantly." },
];

const INDUSTRIES = [
  {
    icon: <SmokingRoomsRoundedIcon />,
    label: "Pan & Cigarette",
    title: "Built for the corner counter",
    points: ["Loose & pack pricing", "Fast repeat billing", "Pan masala, tobacco & FMCG", "Cash / UPI in a tap"],
  },
  {
    icon: <RestaurantRoundedIcon />,
    label: "Food & Restaurant",
    title: "Menus, GST bills & KOT-ready",
    points: ["Menu items with categories", "GST-inclusive tax receipts", "Thermal bill printing", "WhatsApp the bill as PDF"],
  },
  {
    icon: <LocalConvenienceStoreRoundedIcon />,
    label: "Retail & Kirana",
    title: "Everything a shop needs",
    points: ["Barcode inventory", "Supplier receipt import", "Sub-categories", "Profit & sales reports"],
  },
];

const STEPS = [
  { n: "01", title: "Request access", desc: "Tell us about your shop and we set up your business account." },
  { n: "02", title: "Add your items", desc: "Import from a receipt photo or add products in minutes." },
  { n: "03", title: "Start selling", desc: "Open the POS on any device and bill your first customer." },
];

const PLANS = [
  { name: "Starter", price: "₹499", period: "/mo", stores: "1 store", features: ["Unlimited items", "POS & GST billing", "Low-stock alerts", "Sales reports"] },
  { name: "Growth", price: "₹1,299", period: "/mo", stores: "Up to 3 stores", featured: true, features: ["Everything in Starter", "Multiple stores", "Store managers", "AI Smart Insights"] },
  { name: "Enterprise", price: "Custom", period: "", stores: "Up to 10 stores", features: ["Everything in Growth", "Dedicated manager", "Custom onboarding", "Priority SLA"] },
];

const TESTIMONIALS = [
  { name: "Rakesh Sharma", role: "Pan shop owner, Indore", quote: "Billing is 3x faster and I finally know what's selling. The restock alerts alone paid for it." },
  { name: "Anil Gupta", role: "Kirana store, Noida", quote: "Imported my whole stock from a supplier receipt photo. Setup took one evening." },
  { name: "Farhan K.", role: "Food cart, Greater Noida", quote: "GST bills print straight to my thermal printer and I WhatsApp receipts to customers. Slick." },
];

const FAQS = [
  { q: "Do I need any special hardware?", a: "No. Dukaan runs in any browser on your phone, tablet or computer. If you have a thermal bill printer, we print straight to it." },
  { q: "Can I run more than one shop?", a: "Yes. On the Growth and Enterprise plans you can add multiple stores and switch between them instantly, with staff logins per store." },
  { q: "Does it support GST billing?", a: "Absolutely — tax-inclusive receipts with CGST/SGST breakdown, your GSTIN and FSSAI details, for both retail and food businesses." },
  { q: "What is AI Smart Insights?", a: "A daily, plain-English summary of your shop — what to reorder, your best sellers, slow movers and revenue trends — so you can act without digging through reports." },
];

export default function LandingPage() {
  const [industry, setIndustry] = useState(0);

  return (
    <Box sx={{ overflow: "hidden" }}>
      {/* ===== HERO ===== */}
      <Box sx={{ position: "relative", background: gradients.hero, borderBottom: "1px solid", borderColor: "divider" }}>
        {/* floating blobs */}
        <Box sx={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
          <Blob sx={{ top: -80, left: -60, background: "rgba(47,126,218,0.30)", animation: "floatySlow 9s ease-in-out infinite" }} />
          <Blob sx={{ top: 40, right: -40, width: 260, height: 260, background: "rgba(124,92,252,0.25)", animation: "floaty 7s ease-in-out infinite" }} />
          <Blob sx={{ bottom: -120, left: "40%", width: 320, height: 320, background: "rgba(46,158,107,0.18)", animation: "floatySlow 11s ease-in-out infinite" }} />
        </Box>

        <Container maxWidth="lg" sx={{ position: "relative", py: { xs: 8, md: 14 } }}>
          <Grid container spacing={5} alignItems="center">
            <Grid item xs={12} md={6.5}>
              <Reveal>
                <Chip
                  icon={<AutoAwesomeRoundedIcon sx={{ fontSize: 16 }} />}
                  label="Now with AI Smart Insights"
                  color="primary"
                  sx={{ mb: 2.5, bgcolor: "rgba(47,126,218,0.10)", color: "primary.main", border: "1px solid rgba(47,126,218,0.25)" }}
                  variant="outlined"
                />
              </Reveal>
              <Reveal delay={0.05}>
                <Typography
                  variant="h1"
                  sx={{ fontSize: { xs: 40, sm: 54, md: 64 }, lineHeight: 1.02, mb: 2.5 }}
                >
                  The POS that runs your{" "}
                  <Box
                    component="span"
                    sx={{
                      background: gradients.brand,
                      backgroundSize: "200% 200%",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      animation: "gradientShift 6s ease infinite",
                    }}
                  >
                    whole shop
                  </Box>
                </Typography>
              </Reveal>
              <Reveal delay={0.1}>
                <Typography variant="h6" sx={{ fontWeight: 400, color: "text.secondary", mb: 4, maxWidth: 540 }}>
                  Billing, inventory, GST receipts and AI-powered guidance — one beautiful app
                  for pan, cigarette, food and retail shops. No hardware, set up in minutes.
                </Typography>
              </Reveal>
              <Reveal delay={0.15}>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                  <Button component={Link} href="/request-account" variant="contained" size="large" endIcon={<ArrowForwardRoundedIcon />}>
                    Start free
                  </Button>
                  <Button component={Link} href="/login" variant="outlined" size="large">
                    Owner login
                  </Button>
                </Stack>
              </Reveal>
              <Reveal delay={0.2}>
                <Stack direction="row" spacing={3} sx={{ mt: 4 }} flexWrap="wrap" useFlexGap>
                  {["No hardware needed", "Works on any device", "Set up in minutes"].map((t) => (
                    <Stack key={t} direction="row" spacing={0.75} alignItems="center">
                      <CheckCircleRoundedIcon sx={{ color: "success.main", fontSize: 18 }} />
                      <Typography variant="body2" color="text.secondary">{t}</Typography>
                    </Stack>
                  ))}
                </Stack>
              </Reveal>
            </Grid>

            <Grid item xs={12} md={5.5}>
              <Reveal delay={0.15} y={40}>
                <Box sx={{ animation: "floaty 6s ease-in-out infinite" }}>
                  <HeroMock />
                </Box>
              </Reveal>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ===== STATS BAND ===== */}
      <Container maxWidth="lg" sx={{ py: { xs: 5, md: 7 } }}>
        <Reveal>
          <Grid container spacing={2} textAlign="center">
            {[
              { end: 2000, suffix: "+", label: "Shops billing daily" },
              { end: 1.2, suffix: "M+", decimals: 1, label: "Items managed" },
              { end: 99.9, suffix: "%", decimals: 1, label: "Uptime" },
              { end: 4.9, suffix: "★", decimals: 1, label: "Owner rating" },
            ].map((s) => (
              <Grid item xs={6} md={3} key={s.label}>
                <Typography variant="h3" sx={{ fontWeight: 800, color: "primary.main" }}>
                  <Counter end={s.end} suffix={s.suffix} decimals={s.decimals || 0} />
                </Typography>
                <Typography variant="body2" color="text.secondary">{s.label}</Typography>
              </Grid>
            ))}
          </Grid>
        </Reveal>
      </Container>

      {/* ===== FEATURES ===== */}
      <Container maxWidth="lg" id="features" sx={{ py: { xs: 6, md: 10 } }}>
        <SectionHead over="Everything you need" title="One app to run the whole counter" />
        <Grid container spacing={2.5}>
          {FEATURES.map((f, i) => (
            <Grid item xs={12} sm={6} md={4} key={f.title}>
              <Reveal delay={(i % 3) * 0.08}>
                <Card
                  sx={{
                    height: "100%",
                    "&:hover": { transform: "translateY(-6px)", boxShadow: "0 20px 40px rgba(16,24,40,0.10)", borderColor: "primary.light" },
                  }}
                >
                  <CardContent sx={{ p: 3.5 }}>
                    <Avatar variant="rounded" sx={{ width: 52, height: 52, mb: 2, color: "#fff", background: gradients.brand }}>
                      {f.icon}
                    </Avatar>
                    <Typography variant="h6" sx={{ mb: 0.75 }}>{f.title}</Typography>
                    <Typography variant="body2" color="text.secondary">{f.desc}</Typography>
                  </CardContent>
                </Card>
              </Reveal>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* ===== AI SECTION ===== */}
      <Box sx={{ py: { xs: 6, md: 10 } }}>
        <Container maxWidth="lg">
          <Reveal>
            <Card
              sx={{
                position: "relative",
                overflow: "hidden",
                color: "#fff",
                border: "none",
                background: "#161B2B",
              }}
            >
              <Box sx={{ position: "absolute", inset: 0, background: gradients.mesh, opacity: 0.9 }} />
              <CardContent sx={{ position: "relative", p: { xs: 3.5, md: 6 } }}>
                <Grid container spacing={4} alignItems="center">
                  <Grid item xs={12} md={6}>
                    <Chip
                      icon={<AutoAwesomeRoundedIcon sx={{ fontSize: 16, color: "#fff !important" }} />}
                      label="AI Smart Insights"
                      sx={{ mb: 2, bgcolor: "rgba(255,255,255,0.14)", color: "#fff" }}
                    />
                    <Typography variant="h3" sx={{ fontSize: { xs: 28, md: 40 }, mb: 2 }}>
                      Your shop&apos;s co-pilot
                    </Typography>
                    <Typography sx={{ opacity: 0.85, mb: 3, maxWidth: 460 }}>
                      Dukaan reads your sales and stock every day and tells you — in plain
                      language — exactly what to do next. Less guesswork, more profit.
                    </Typography>
                    <Stack spacing={1.5}>
                      {[
                        "Restock suggestions before you run out",
                        "Best-sellers and slow movers, ranked",
                        "Revenue & margin trends explained",
                      ].map((t) => (
                        <Stack key={t} direction="row" spacing={1.25} alignItems="center">
                          <BoltRoundedIcon sx={{ color: "#8FE3B8", fontSize: 20 }} />
                          <Typography variant="body2">{t}</Typography>
                        </Stack>
                      ))}
                    </Stack>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <AiMock />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Reveal>
        </Container>
      </Box>

      {/* ===== INDUSTRIES ===== */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <SectionHead over="Made for your business" title="Whatever you sell, we fit right in" />
        <Reveal>
          <Tabs
            value={industry}
            onChange={(_e, v) => setIndustry(v)}
            centered
            sx={{ mb: 4, "& .MuiTab-root": { fontWeight: 700, minHeight: 48 } }}
          >
            {INDUSTRIES.map((ind, i) => (
              <Tab key={i} icon={ind.icon} iconPosition="start" label={ind.label} />
            ))}
          </Tabs>
        </Reveal>
        <Reveal key={industry}>
          <Card sx={{ overflow: "hidden" }}>
            <Grid container>
              <Grid item xs={12} md={6} sx={{ background: gradients.brandSoft, p: { xs: 4, md: 6 }, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <Avatar variant="rounded" sx={{ width: 56, height: 56, mb: 2, color: "#fff", background: gradients.brand }}>
                  {INDUSTRIES[industry].icon}
                </Avatar>
                <Typography variant="h4" sx={{ mb: 1 }}>{INDUSTRIES[industry].title}</Typography>
                <Typography color="text.secondary">Everything tailored to how {INDUSTRIES[industry].label.toLowerCase()} shops actually work.</Typography>
              </Grid>
              <Grid item xs={12} md={6} sx={{ p: { xs: 4, md: 6 } }}>
                <Stack spacing={2}>
                  {INDUSTRIES[industry].points.map((p) => (
                    <Stack key={p} direction="row" spacing={1.5} alignItems="center">
                      <CheckCircleRoundedIcon color="primary" />
                      <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>{p}</Typography>
                    </Stack>
                  ))}
                  <Button component={Link} href="/request-account" endIcon={<ArrowForwardRoundedIcon />} sx={{ alignSelf: "flex-start", mt: 1 }}>
                    Get started
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </Card>
        </Reveal>
      </Container>

      {/* ===== HOW IT WORKS ===== */}
      <Box sx={{ bgcolor: "background.default", borderTop: "1px solid", borderBottom: "1px solid", borderColor: "divider" }}>
        <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
          <SectionHead over="Get going fast" title="Live in three simple steps" />
          <Grid container spacing={3}>
            {STEPS.map((s, i) => (
              <Grid item xs={12} md={4} key={s.n}>
                <Reveal delay={i * 0.1}>
                  <Card sx={{ height: "100%", p: 1 }}>
                    <CardContent>
                      <Typography sx={{ fontSize: 44, fontWeight: 800, background: gradients.brand, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", mb: 1 }}>
                        {s.n}
                      </Typography>
                      <Typography variant="h6" sx={{ mb: 0.5 }}>{s.title}</Typography>
                      <Typography variant="body2" color="text.secondary">{s.desc}</Typography>
                    </CardContent>
                  </Card>
                </Reveal>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ===== PRICING ===== */}
      <Container maxWidth="lg" id="pricing" sx={{ py: { xs: 6, md: 10 } }}>
        <SectionHead over="Simple pricing" title="Plans that grow with you" />
        <Grid container spacing={2.5} justifyContent="center">
          {PLANS.map((p, i) => (
            <Grid item xs={12} sm={6} md={4} key={p.name}>
              <Reveal delay={i * 0.08}>
                <Card
                  sx={{
                    height: "100%",
                    position: "relative",
                    borderColor: p.featured ? "primary.main" : "divider",
                    borderWidth: p.featured ? 2 : 1,
                    transform: p.featured ? { md: "scale(1.04)" } : "none",
                    boxShadow: p.featured ? "0 24px 50px rgba(47,126,218,0.20)" : undefined,
                    "&:hover": { transform: p.featured ? { md: "scale(1.06)" } : "translateY(-6px)" },
                  }}
                >
                  {p.featured && <Chip label="Most Popular" color="primary" size="small" sx={{ position: "absolute", top: 16, right: 16 }} />}
                  <CardContent sx={{ p: 3.5 }}>
                    <Typography variant="h6">{p.name}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{p.stores}</Typography>
                    <Stack direction="row" alignItems="baseline" spacing={0.5} sx={{ mb: 2.5 }}>
                      <Typography variant="h3" fontWeight={800}>{p.price}</Typography>
                      <Typography variant="body2" color="text.secondary">{p.period}</Typography>
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
                    <Button component={Link} href="/request-account" variant={p.featured ? "contained" : "outlined"} fullWidth>
                      Get started
                    </Button>
                  </CardContent>
                </Card>
              </Reveal>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* ===== TESTIMONIALS ===== */}
      <Box sx={{ bgcolor: "background.default", borderTop: "1px solid", borderColor: "divider" }}>
        <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
          <SectionHead over="Loved by shopkeepers" title="Owners who switched, stayed" />
          <Grid container spacing={2.5}>
            {TESTIMONIALS.map((t, i) => (
              <Grid item xs={12} md={4} key={t.name}>
                <Reveal delay={i * 0.1}>
                  <Card sx={{ height: "100%" }}>
                    <CardContent sx={{ p: 3.5 }}>
                      <Typography sx={{ color: "warning.main", mb: 1.5, letterSpacing: 2 }}>★★★★★</Typography>
                      <Typography sx={{ mb: 2.5, fontWeight: 500 }}>&ldquo;{t.quote}&rdquo;</Typography>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar sx={{ background: gradients.brand, color: "#fff" }}>{t.name[0]}</Avatar>
                        <Box>
                          <Typography variant="subtitle2">{t.name}</Typography>
                          <Typography variant="caption" color="text.secondary">{t.role}</Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Reveal>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ===== FAQ ===== */}
      <Container maxWidth="md" sx={{ py: { xs: 6, md: 10 } }}>
        <SectionHead over="Questions?" title="Frequently asked" />
        <Reveal>
          <Box>
            {FAQS.map((f) => (
              <Accordion key={f.q} disableGutters elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, mb: 1.5, "&:before": { display: "none" } }}>
                <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
                  <Typography variant="subtitle1">{f.q}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography color="text.secondary">{f.a}</Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </Reveal>
      </Container>

      {/* ===== FINAL CTA ===== */}
      <Container maxWidth="lg" sx={{ pb: { xs: 8, md: 12 } }}>
        <Reveal>
          <Card sx={{ position: "relative", overflow: "hidden", border: "none", color: "#fff", background: "#161B2B" }}>
            <Box sx={{ position: "absolute", inset: 0, background: gradients.mesh }} />
            <CardContent sx={{ position: "relative", p: { xs: 5, md: 9 }, textAlign: "center" }}>
              <Typography variant="h2" sx={{ fontSize: { xs: 30, md: 46 }, mb: 1.5 }}>
                Ready to modernise your shop?
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 400, opacity: 0.85, mb: 4, maxWidth: 560, mx: "auto" }}>
                Join thousands of owners billing smarter every day. Tell us about your shop and
                we&apos;ll hand you the keys.
              </Typography>
              <Button
                component={Link}
                href="/request-account"
                size="large"
                endIcon={<ArrowForwardRoundedIcon />}
                sx={{ bgcolor: "#fff", color: "primary.main", "&:hover": { bgcolor: "#EDEFF3" } }}
              >
                Request your account
              </Button>
            </CardContent>
          </Card>
        </Reveal>
      </Container>
    </Box>
  );
}

function Blob({ sx }) {
  return (
    <Box
      sx={{
        position: "absolute",
        width: 220,
        height: 220,
        borderRadius: "50%",
        filter: "blur(60px)",
        ...sx,
      }}
    />
  );
}

function SectionHead({ over, title }) {
  return (
    <Reveal>
      <Box sx={{ textAlign: "center", mb: { xs: 4, md: 6 } }}>
        <Typography variant="overline" sx={{ color: "primary.main", fontWeight: 700, letterSpacing: 1.5 }}>
          {over}
        </Typography>
        <Typography variant="h2" sx={{ fontSize: { xs: 28, md: 42 } }}>
          {title}
        </Typography>
      </Box>
    </Reveal>
  );
}

function HeroMock() {
  return (
    <Card sx={{ boxShadow: "0 30px 80px rgba(16,24,40,0.20)", overflow: "hidden" }}>
      <Box sx={{ background: gradients.dark, px: 2.5, py: 1.75, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Typography variant="subtitle2" sx={{ color: "#fff" }}>Today&apos;s Summary</Typography>
        <Chip size="small" label="Live" sx={{ bgcolor: "#8FE3B8", color: "#0C3D28", fontWeight: 700 }} />
      </Box>
      <CardContent sx={{ p: 3 }}>
        <Grid container spacing={2}>
          {[
            { label: "Revenue", value: "₹12,480", color: "primary.main" },
            { label: "Profit", value: "₹3,120", color: "success.main" },
            { label: "Orders", value: "86", color: "text.primary" },
            { label: "Low stock", value: "4", color: "warning.main" },
          ].map((s) => (
            <Grid item xs={6} key={s.label}>
              <Box sx={{ p: 1.75, borderRadius: 2.5, bgcolor: "background.default", border: "1px solid", borderColor: "divider" }}>
                <Typography variant="caption" color="text.secondary">{s.label}</Typography>
                <Typography variant="h6" sx={{ color: s.color, fontWeight: 800 }}>{s.value}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
        <Box sx={{ mt: 2 }}>
          {[
            { n: "Gold Flake Kings", q: "24 sold", v: "₹8,160" },
            { n: "Coca Cola 750ml", q: "31 sold", v: "₹1,395" },
            { n: "Veg Momo Plate", q: "48 sold", v: "₹2,880" },
          ].map((r, i) => (
            <Box key={r.n} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 1.25, borderTop: i === 0 ? "none" : "1px solid", borderColor: "divider" }}>
              <Box>
                <Typography variant="body2" fontWeight={600}>{r.n}</Typography>
                <Typography variant="caption" color="text.secondary">{r.q}</Typography>
              </Box>
              <Typography variant="body2" fontWeight={700}>{r.v}</Typography>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}

function AiMock() {
  const rows = [
    { icon: <WarningAmberRoundedIcon />, color: "#E0A23B", text: "Reorder Classic Milds — only 8 left, sells ~12/day." },
    { icon: <InsightsRoundedIcon />, color: "#8FE3B8", text: "Momo Plate is up 34% this week — your top mover." },
    { icon: <BoltRoundedIcon />, color: "#7CA9F5", text: "Evenings drive 61% of sales. Stock up before 5pm." },
  ];
  return (
    <Box
      sx={{
        borderRadius: 4,
        p: 2.5,
        background: "rgba(255,255,255,0.08)",
        border: "1px solid rgba(255,255,255,0.15)",
        backdropFilter: "blur(6px)",
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
        <Avatar sx={{ width: 30, height: 30, background: gradients.brand }}>
          <AutoAwesomeRoundedIcon sx={{ fontSize: 16 }} />
        </Avatar>
        <Typography variant="subtitle2" sx={{ color: "#fff" }}>Insights for today</Typography>
      </Stack>
      <Stack spacing={1.25}>
        {rows.map((r, i) => (
          <Reveal key={i} delay={0.15 * i} once={false}>
            <Stack
              direction="row"
              spacing={1.25}
              alignItems="center"
              sx={{ p: 1.5, borderRadius: 2, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <Avatar sx={{ width: 30, height: 30, bgcolor: "rgba(255,255,255,0.1)", color: r.color }}>{r.icon}</Avatar>
              <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.92)" }}>{r.text}</Typography>
            </Stack>
          </Reveal>
        ))}
      </Stack>
    </Box>
  );
}
