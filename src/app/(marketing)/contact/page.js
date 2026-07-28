import Link from "next/link";
import {
  Box,
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  Avatar,
  Stack,
  Button,
} from "@mui/material";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";

export const metadata = { title: "Contact — Dukaan" };

const CONTACTS = [
  { icon: <EmailRoundedIcon />, label: "Email us", value: "support@dukaan.app" },
  { icon: <PhoneRoundedIcon />, label: "Call us", value: "+91 98765 43210" },
  { icon: <LocationOnRoundedIcon />, label: "Office", value: "Bengaluru, Karnataka, India" },
  { icon: <ScheduleRoundedIcon />, label: "Hours", value: "Mon–Sat, 9am – 8pm IST" },
];

export default function ContactPage() {
  return (
    <Box>
      <Box sx={{ bgcolor: "background.default", borderBottom: "1px solid", borderColor: "divider" }}>
        <Container maxWidth="md" sx={{ py: { xs: 7, md: 10 }, textAlign: "center" }}>
          <Typography variant="overline" color="primary" fontWeight={700}>
            Contact
          </Typography>
          <Typography variant="h2" sx={{ fontWeight: 800, letterSpacing: "-0.02em", fontSize: { xs: 34, md: 48 }, mb: 2 }}>
            We&apos;re here to help
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 400, color: "text.secondary", maxWidth: 560, mx: "auto" }}>
            Questions about Dukaan, pricing or setting up your shop? Reach out — a real
            person will get back to you.
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 7, md: 10 } }}>
        <Grid container spacing={2.5}>
          {CONTACTS.map((c) => (
            <Grid item xs={12} sm={6} md={3} key={c.label}>
              <Card sx={{ height: "100%" }}>
                <CardContent sx={{ p: 3 }}>
                  <Avatar variant="rounded" sx={{ bgcolor: "rgba(47,126,218,0.10)", color: "primary.main", width: 46, height: 46, mb: 2 }}>
                    {c.icon}
                  </Avatar>
                  <Typography variant="body2" color="text.secondary">
                    {c.label}
                  </Typography>
                  <Typography variant="subtitle1">{c.value}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Card sx={{ mt: 4, bgcolor: "primary.main", color: "#fff" }}>
          <CardContent sx={{ p: { xs: 4, md: 6 }, textAlign: "center" }}>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
              Want to open an account?
            </Typography>
            <Typography sx={{ opacity: 0.9, mb: 3 }}>
              Skip the back-and-forth and send us your shop details directly.
            </Typography>
            <Button
              component={Link}
              href="/request-account"
              size="large"
              sx={{ bgcolor: "#fff", color: "primary.main", "&:hover": { bgcolor: "#EDEFF3" } }}
            >
              Request Access
            </Button>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
