"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Stack,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  LinearProgress,
} from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import PaidRoundedIcon from "@mui/icons-material/PaidRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import ShoppingBagRoundedIcon from "@mui/icons-material/ShoppingBagRounded";
import StatCard from "@/components/StatCard";
import { formatCurrency, formatNumber } from "@/lib/format";

export default function ReportsPage() {
  const [data, setData] = useState(null);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (d) => {
    setLoading(true);
    const res = await fetch(`/api/reports?days=${d}`).then((r) => r.json());
    setData(res.data || null);
    setLoading(false);
  }, []);

  useEffect(() => {
    load(days);
  }, [days, load]);

  const t = data?.totals || { revenue: 0, profit: 0, orders: 0, items: 0 };
  const perStore = data?.perStore || [];
  const hasRevenue = perStore.some((s) => s.revenue > 0);

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
          <Typography variant="h4">Reports</Typography>
          <Typography variant="body2" color="text.secondary">
            Sales performance across all your stores
          </Typography>
        </Box>
        <ToggleButtonGroup
          size="small"
          exclusive
          value={days}
          onChange={(_e, v) => v && setDays(v)}
          color="primary"
        >
          <ToggleButton value={7}>7 days</ToggleButton>
          <ToggleButton value={30}>30 days</ToggleButton>
          <ToggleButton value={90}>90 days</ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      <Grid container spacing={2.5}>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard title="Total Revenue" value={formatCurrency(t.revenue)} icon={<PaidRoundedIcon />} color="primary" sub={`Last ${days} days`} />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard title="Total Profit" value={formatCurrency(t.profit)} icon={<TrendingUpRoundedIcon />} color="success" sub="Across all stores" />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard title="Orders" value={formatNumber(t.orders)} icon={<ReceiptLongRoundedIcon />} color="secondary" sub="Invoices generated" />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard title="Items Sold" value={formatNumber(t.items)} icon={<ShoppingBagRoundedIcon />} color="warning" sub="Total units" />
        </Grid>

        <Grid item xs={12} lg={7}>
          <Card sx={{ height: "100%" }}>
            <CardHeader title="Revenue by Store" titleTypographyProps={{ variant: "h6" }} />
            <CardContent>
              {hasRevenue ? (
                <BarChart
                  height={320}
                  dataset={perStore}
                  xAxis={[{ scaleType: "band", dataKey: "name" }]}
                  series={[
                    { dataKey: "revenue", label: "Revenue", color: "#2F7EDA" },
                    { dataKey: "profit", label: "Profit", color: "#2E9E6B" },
                  ]}
                  margin={{ left: 70 }}
                />
              ) : (
                <Box sx={{ py: 6, textAlign: "center" }}>
                  <Typography color="text.secondary">
                    No sales in this period yet.
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={5}>
          <Card sx={{ height: "100%" }}>
            <CardHeader title="Top Products (all stores)" titleTypographyProps={{ variant: "h6" }} />
            <Divider />
            <CardContent sx={{ p: 0 }}>
              {(data?.topProducts || []).length === 0 ? (
                <Box sx={{ py: 6, textAlign: "center" }}>
                  <Typography color="text.secondary">No sales data yet.</Typography>
                </Box>
              ) : (
                <Table size="small">
                  <TableBody>
                    {data.topProducts.map((p, i) => (
                      <TableRow key={p._id || i}>
                        <TableCell sx={{ width: 32, color: "text.secondary" }}>{i + 1}</TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {p._id}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatNumber(p.quantity)} sold
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight={700}>
                            {formatCurrency(p.revenue)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardHeader title="Store Breakdown" titleTypographyProps={{ variant: "h6" }} />
            <Divider />
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Store</TableCell>
                    <TableCell align="right">Revenue</TableCell>
                    <TableCell align="right">Profit</TableCell>
                    <TableCell align="right">Orders</TableCell>
                    <TableCell align="right">Items Sold</TableCell>
                    <TableCell align="right">Products</TableCell>
                    <TableCell align="right">Stock Value</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {perStore.map((s) => (
                    <TableRow key={s.storeId} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {s.name}
                        </Typography>
                        {s.location && (
                          <Typography variant="caption" color="text.secondary">
                            {s.location}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="right">{formatCurrency(s.revenue)}</TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" color="success.main" fontWeight={600}>
                          {formatCurrency(s.profit)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">{formatNumber(s.orders)}</TableCell>
                      <TableCell align="right">{formatNumber(s.items)}</TableCell>
                      <TableCell align="right">{formatNumber(s.products)}</TableCell>
                      <TableCell align="right">{formatCurrency(s.retailValue)}</TableCell>
                    </TableRow>
                  ))}
                  {perStore.length > 0 && (
                    <TableRow sx={{ "& td": { borderTop: "2px solid", borderColor: "divider" } }}>
                      <TableCell>
                        <Typography variant="body2" fontWeight={700}>
                          All stores
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={700}>
                          {formatCurrency(t.revenue)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={700} color="success.main">
                          {formatCurrency(t.profit)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={700}>
                          {formatNumber(t.orders)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={700}>
                          {formatNumber(t.items)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">—</TableCell>
                      <TableCell align="right">—</TableCell>
                    </TableRow>
                  )}
                  {!loading && perStore.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} sx={{ textAlign: "center", py: 5, color: "text.secondary" }}>
                        No stores yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
