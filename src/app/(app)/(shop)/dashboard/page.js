"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Grid,
  Card,
  CardContent,
  CardHeader,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Chip,
  Button,
  LinearProgress,
  Stack,
  Divider,
} from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import PaidRoundedIcon from "@mui/icons-material/PaidRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import StatCard from "@/components/StatCard";
import { formatCurrency, formatNumber } from "@/lib/format";

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((res) => {
        if (res.error) setError(res.error);
        else setData(res.data);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LinearProgress />;

  if (error)
    return (
      <Card>
        <CardContent>
          <Typography color="error" fontWeight={600}>
            Could not load dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {error}
          </Typography>
          <Typography variant="body2" sx={{ mt: 2 }}>
            Make sure MongoDB is reachable, then refresh.
          </Typography>
        </CardContent>
      </Card>
    );

  const t = data.totals;

  return (
    <Box>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ sm: "center" }}
        spacing={1.5}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h4">Dashboard</Typography>
          <Typography variant="body2" color="text.secondary">
            Overview of your store performance
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<ReceiptLongRoundedIcon />}
          onClick={() => router.push("/pos")}
        >
          New Sale
        </Button>
      </Stack>

      <Grid container spacing={2.5}>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Today's Revenue"
            value={formatCurrency(data.today.revenue)}
            sub={`${data.today.orders} orders today`}
            icon={<PaidRoundedIcon />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Today's Profit"
            value={formatCurrency(data.today.profit)}
            sub="Estimated margin"
            icon={<TrendingUpRoundedIcon />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Products"
            value={formatNumber(t.products)}
            sub={`${formatCurrency(t.retailValue)} retail value`}
            icon={<Inventory2RoundedIcon />}
            color="secondary"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Low Stock Items"
            value={formatNumber(data.lowStockCount)}
            sub={`${data.outOfStockCount} out of stock`}
            icon={<WarningAmberRoundedIcon />}
            color="warning"
          />
        </Grid>

        <Grid item xs={12} lg={8}>
          <Card sx={{ height: "100%" }}>
            <CardHeader
              title="Revenue — Last 7 days"
              titleTypographyProps={{ variant: "h6" }}
            />
            <CardContent>
              {data.trend.some((d) => d.revenue > 0) ? (
                <BarChart
                  height={300}
                  dataset={data.trend}
                  xAxis={[{ scaleType: "band", dataKey: "label" }]}
                  series={[
                    { dataKey: "revenue", label: "Revenue", color: "#2F7EDA" },
                  ]}
                  slotProps={{ legend: { hidden: true } }}
                  margin={{ left: 70 }}
                />
              ) : (
                <EmptyBlock text="No sales recorded in the last 7 days." />
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Card sx={{ height: "100%" }}>
            <CardHeader
              title="Low Stock Alerts"
              titleTypographyProps={{ variant: "h6" }}
              action={
                <Button size="small" onClick={() => router.push("/low-stock")}>
                  View all
                </Button>
              }
            />
            <Divider />
            <CardContent sx={{ p: 0 }}>
              {data.lowStock.length === 0 ? (
                <EmptyBlock text="Everything is well stocked. 🎉" />
              ) : (
                <List dense>
                  {data.lowStock.map((p) => (
                    <ListItem
                      key={p._id}
                      secondaryAction={
                        <Chip
                          size="small"
                          label={`${p.stock} ${p.unit}`}
                          color={p.stock <= 0 ? "error" : "warning"}
                          variant={p.stock <= 0 ? "filled" : "outlined"}
                        />
                      }
                    >
                      <ListItemText
                        primary={p.name}
                        secondary={p.category}
                        primaryTypographyProps={{ fontWeight: 600, noWrap: true }}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={7}>
          <Card>
            <CardHeader
              title="Top Selling Products"
              titleTypographyProps={{ variant: "h6" }}
            />
            <Divider />
            <CardContent sx={{ p: 0 }}>
              {data.topProducts.length === 0 ? (
                <EmptyBlock text="No sales data yet." />
              ) : (
                <List>
                  {data.topProducts.map((p, i) => (
                    <ListItem key={p._id || i} divider={i < data.topProducts.length - 1}>
                      <Box
                        sx={{
                          width: 28,
                          height: 28,
                          borderRadius: "50%",
                          bgcolor: "background.default",
                          border: "1px solid",
                          borderColor: "divider",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          mr: 2,
                          fontWeight: 700,
                          fontSize: 13,
                        }}
                      >
                        {i + 1}
                      </Box>
                      <ListItemText
                        primary={p._id}
                        secondary={`${formatNumber(p.quantity)} sold`}
                        primaryTypographyProps={{ fontWeight: 600 }}
                      />
                      <Typography fontWeight={700}>
                        {formatCurrency(p.revenue)}
                      </Typography>
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={5}>
          <Card>
            <CardHeader
              title="All-time Summary"
              titleTypographyProps={{ variant: "h6" }}
            />
            <Divider />
            <CardContent>
              <SummaryRow label="Total revenue" value={formatCurrency(t.revenue)} />
              <SummaryRow label="Total profit" value={formatCurrency(t.profit)} />
              <SummaryRow label="Total orders" value={formatNumber(t.orders)} />
              <SummaryRow
                label="Inventory value (cost)"
                value={formatCurrency(t.inventoryValue)}
              />
              <SummaryRow
                label="Inventory value (retail)"
                value={formatCurrency(t.retailValue)}
                last
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

function SummaryRow({ label, value, last }) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        py: 1.25,
        borderBottom: last ? "none" : "1px solid",
        borderColor: "divider",
      }}
    >
      <Typography color="text.secondary">{label}</Typography>
      <Typography fontWeight={700}>{value}</Typography>
    </Box>
  );
}

function EmptyBlock({ text }) {
  return (
    <Box sx={{ p: 4, textAlign: "center" }}>
      <Typography color="text.secondary">{text}</Typography>
    </Box>
  );
}
