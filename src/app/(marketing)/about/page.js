import {
  Box,
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  Avatar,
  Stack,
} from "@mui/material";
import FlagRoundedIcon from "@mui/icons-material/FlagRounded";
import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";

export const metadata = { title: "About — Dukaan" };

const VALUES = [
  { icon: <FlagRoundedIcon />, title: "Made for small shops", desc: "We build for the corner pan shop and the neighbourhood kirana — not just big chains." },
  { icon: <BoltRoundedIcon />, title: "Fast and simple", desc: "Software should get out of the way. Every screen is designed for a busy counter." },
  { icon: <FavoriteRoundedIcon />, title: "Owner-first", desc: "Your data, your stores, your team. You stay in full control at all times." },
];

export default function AboutPage() {
  return (
    <Box>
      <Box sx={{ bgcolor: "background.default", borderBottom: "1px solid", borderColor: "divider" }}>
        <Container maxWidth="md" sx={{ py: { xs: 7, md: 10 }, textAlign: "center" }}>
          <Typography variant="overline" color="primary" fontWeight={700}>
            About Dukaan
          </Typography>
          <Typography variant="h2" sx={{ fontWeight: 800, letterSpacing: "-0.02em", fontSize: { xs: 34, md: 48 }, mb: 2 }}>
            Helping shopkeepers thrive
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 400, color: "text.secondary", maxWidth: 640, mx: "auto" }}>
            Dukaan started with a simple belief: the millions of small shops that power
            everyday life deserve software as good as the big retailers use.
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 7, md: 10 } }}>
        <Grid container spacing={3}>
          {VALUES.map((v) => (
            <Grid item xs={12} md={4} key={v.title}>
              <Card sx={{ height: "100%" }}>
                <CardContent sx={{ p: 3.5 }}>
                  <Avatar variant="rounded" sx={{ bgcolor: "rgba(47,126,218,0.10)", color: "primary.main", width: 48, height: 48, mb: 2 }}>
                    {v.icon}
                  </Avatar>
                  <Typography variant="h6" sx={{ mb: 0.5 }}>
                    {v.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {v.desc}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Card sx={{ mt: 5 }}>
          <CardContent sx={{ p: { xs: 3, md: 5 } }}>
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Typography variant="h5" sx={{ mb: 1.5 }}>
                  Our mission
                </Typography>
                <Typography color="text.secondary">
                  To give every shop owner the tools to sell faster, waste less and grow
                  with confidence — without needing a computer science degree or expensive
                  hardware. Just open Dukaan and start selling.
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Stack spacing={2}>
                  {[
                    { k: "10,000+", v: "Products managed daily" },
                    { k: "99.9%", v: "Uptime for your counter" },
                    { k: "1 day", v: "Typical account setup time" },
                  ].map((s) => (
                    <Stack key={s.v} direction="row" spacing={2} alignItems="baseline">
                      <Typography variant="h5" color="primary.main" fontWeight={800} sx={{ minWidth: 110 }}>
                        {s.k}
                      </Typography>
                      <Typography color="text.secondary">{s.v}</Typography>
                    </Stack>
                  ))}
                </Stack>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
