"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Box,
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Stack,
  Alert,
  MenuItem,
} from "@mui/material";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import Logo from "@/components/Logo";

const EMPTY = {
  businessName: "",
  ownerName: "",
  email: "",
  phone: "",
  storeCount: 1,
  message: "",
};

export default function RequestAccountPage() {
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.businessName || !form.ownerName || !form.email) {
      setError("Please fill in your business name, your name and email.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/account-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Something went wrong");
      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <Container maxWidth="sm" sx={{ py: { xs: 8, md: 12 } }}>
        <Card>
          <CardContent sx={{ p: { xs: 4, md: 6 }, textAlign: "center" }}>
            <CheckCircleRoundedIcon sx={{ fontSize: 64, color: "success.main", mb: 2 }} />
            <Typography variant="h4" sx={{ mb: 1 }}>
              Request received!
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 4 }}>
              Thanks, {form.ownerName.split(" ")[0]}. Our team will review your details and
              reach out at <strong>{form.email}</strong> to set up your account.
            </Typography>
            <Button component={Link} href="/" variant="contained">
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Box sx={{ bgcolor: "background.default" }}>
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Grid container spacing={5} alignItems="center">
          <Grid item xs={12} md={5}>
            <Box sx={{ mb: 2.5 }}>
              <Logo height={34} />
            </Box>
            <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: "-0.02em", fontSize: { xs: 30, md: 40 }, mb: 2 }}>
              Request your Dukaan account
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Tell us a bit about your shop. Our team creates your business profile and
              sends you a secure owner login — usually within one business day.
            </Typography>
            <Stack spacing={1.5}>
              {[
                "We set up your account for you",
                "You get an owner username & password",
                "Add stores and staff yourself",
              ].map((t) => (
                <Stack key={t} direction="row" spacing={1} alignItems="center">
                  <CheckCircleRoundedIcon sx={{ color: "success.main", fontSize: 20 }} />
                  <Typography variant="body2">{t}</Typography>
                </Stack>
              ))}
            </Stack>
          </Grid>

          <Grid item xs={12} md={7}>
            <Card>
              <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                {error && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                )}
                <form onSubmit={submit}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField label="Business name" value={form.businessName} onChange={set("businessName")} fullWidth required />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField label="Your name" value={form.ownerName} onChange={set("ownerName")} fullWidth required />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField label="Email" type="email" value={form.email} onChange={set("email")} fullWidth required />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField label="Phone" value={form.phone} onChange={set("phone")} fullWidth />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField select label="How many stores?" value={form.storeCount} onChange={set("storeCount")} fullWidth>
                        {[1, 2, 3, 5, 10].map((n) => (
                          <MenuItem key={n} value={n}>
                            {n} {n === 1 ? "store" : "stores"}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField label="Anything else? (optional)" value={form.message} onChange={set("message")} fullWidth multiline rows={3} />
                    </Grid>
                    <Grid item xs={12}>
                      <Button type="submit" variant="contained" size="large" fullWidth disabled={submitting}>
                        {submitting ? "Submitting…" : "Submit Request"}
                      </Button>
                    </Grid>
                  </Grid>
                </form>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
