"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Grid,
  Card,
  CardHeader,
  CardContent,
  Typography,
  Divider,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Alert,
  Skeleton,
} from "@mui/material";
import { LineChart } from "@mui/x-charts/LineChart";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import PaidRoundedIcon from "@mui/icons-material/PaidRounded";
import SavingsRoundedIcon from "@mui/icons-material/SavingsRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import StatCard from "@/components/StatCard";
import { formatCurrency } from "@/lib/format";

const fmtDay = (iso) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

export default function ProjectionsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/projections")
      .then((r) => r.json())
      .then((j) => {
        if (j.error) setError(j.error);
        else setData(j.data);
      })
      .catch(() => setError("Could not load projections"))
      .finally(() => setLoading(false));
  }, []);

  const dataset = useMemo(() => {
    if (!data) return [];
    const actual = (data.daily || []).slice(-14).map((d) => ({
      label: fmtDay(d.date),
      actual: d.revenue,
      forecast: null,
    }));
    const fc = (data.forecast || []).slice(0, 14).map((d) => ({
      label: fmtDay(d.date),
      actual: null,
      forecast: d.revenue,
    }));
    // Bridge the two lines so the forecast visually continues the actual line.
    if (actual.length) actual[actual.length - 1].forecast = actual[actual.length - 1].actual;
    return [...actual, ...fc];
  }, [data]);

  if (loading) {
    return (
      <Box>
        <Typography variant="h4" fontWeight={800} gutterBottom>
          AI Projections
        </Typography>
        <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
          {[0, 1, 2, 3].map((i) => (
            <Grid item xs={12} sm={6} lg={3} key={i}>
              <Skeleton variant="rounded" height={98} />
            </Grid>
          ))}
          <Grid item xs={12}>
            <Skeleton variant="rounded" height={360} />
          </Grid>
        </Grid>
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Typography variant="h4" fontWeight={800} gutterBottom>
          AI Projections
        </Typography>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  const trend = data.trendPct;
  const trendLabel =
    trend == null ? "Not enough history" : `${trend >= 0 ? "+" : ""}${trend}% vs last week`;

  return (
    <Box>
      <Typography variant="h4" fontWeight={800}>
        AI Projections
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 2.5 }}>
        Forecasts for sales, profit and stock based on your recent trend
      </Typography>

      {!data.hasData && (
        <Alert severity="info" sx={{ mb: 2.5 }}>
          Projections get more accurate as you record sales. Make a few sales and check back.
        </Alert>
      )}

      {data.narrative && (
        <Card sx={{ mb: 2.5, bgcolor: "rgba(124,92,252,0.06)", border: "1px solid", borderColor: "rgba(124,92,252,0.25)" }}>
          <CardContent sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
            <AutoAwesomeRoundedIcon sx={{ color: "secondary.main", mt: 0.25 }} />
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                AI Summary
                {data.generatedBy === "ai" && (
                  <Chip size="small" label="Claude" sx={{ ml: 1, height: 20 }} color="secondary" variant="outlined" />
                )}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {data.narrative}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}

      <Grid container spacing={2.5}>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Projected revenue (7 days)"
            value={formatCurrency(data.salesNext7)}
            icon={<TrendingUpRoundedIcon />}
            color="primary"
            sub={trendLabel}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Projected revenue (30 days)"
            value={formatCurrency(data.salesNext30)}
            icon={<CalendarMonthRoundedIcon />}
            color="secondary"
            sub="Next month"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Projected profit (30 days)"
            value={formatCurrency(data.profitNext30)}
            icon={<SavingsRoundedIcon />}
            color="success"
            sub="Estimated"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Avg daily revenue"
            value={formatCurrency(data.avgDailyRevenue)}
            icon={<PaidRoundedIcon />}
            color="warning"
            sub="Last 30 days"
          />
        </Grid>

        <Grid item xs={12} lg={7}>
          <Card sx={{ height: "100%" }}>
            <CardHeader
              title="Revenue forecast"
              subheader="Last 14 days (actual) and next 14 days (projected)"
              titleTypographyProps={{ variant: "h6" }}
            />
            <CardContent>
              {dataset.length > 1 ? (
                <LineChart
                  height={320}
                  dataset={dataset}
                  xAxis={[{ scaleType: "point", dataKey: "label" }]}
                  series={[
                    { dataKey: "actual", label: "Actual", color: "#2F7EDA", connectNulls: true, showMark: false },
                    { dataKey: "forecast", label: "Projected", color: "#7C5CFC", connectNulls: true, showMark: false },
                  ]}
                  margin={{ left: 70 }}
                />
              ) : (
                <Box sx={{ py: 6, textAlign: "center" }}>
                  <Typography color="text.secondary">Not enough data to chart yet.</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={5}>
          <Card sx={{ height: "100%" }}>
            <CardHeader
              title="Stock projection"
              subheader="Items likely to run out soonest"
              titleTypographyProps={{ variant: "h6" }}
            />
            <Divider />
            <CardContent sx={{ p: 0 }}>
              {(data.stockouts || []).length === 0 ? (
                <Box sx={{ py: 6, textAlign: "center", px: 2 }}>
                  <Typography color="text.secondary">
                    No sales velocity yet — sell a few items to project stock-outs.
                  </Typography>
                </Box>
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Item</TableCell>
                      <TableCell align="right">In stock</TableCell>
                      <TableCell align="right">Per day</TableCell>
                      <TableCell align="right">Runs out</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.stockouts.map((s) => {
                      const urgent = s.daysLeft != null && s.daysLeft <= 7;
                      return (
                        <TableRow key={s.id}>
                          <TableCell>{s.name}</TableCell>
                          <TableCell align="right">
                            {s.stock} {s.unit}
                          </TableCell>
                          <TableCell align="right">{s.perDay}</TableCell>
                          <TableCell align="right">
                            <Chip
                              size="small"
                              label={s.daysLeft == null ? "—" : `${s.daysLeft}d`}
                              color={urgent ? "error" : "default"}
                              variant={urgent ? "filled" : "outlined"}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
