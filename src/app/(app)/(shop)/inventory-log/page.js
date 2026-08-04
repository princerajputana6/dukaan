"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
  TableRow,
  Divider,
  LinearProgress,
  Chip,
} from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import { DataGrid } from "@mui/x-data-grid";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import PaidRoundedIcon from "@mui/icons-material/PaidRounded";
import PlaylistAddCheckRoundedIcon from "@mui/icons-material/PlaylistAddCheckRounded";
import CategoryRoundedIcon from "@mui/icons-material/CategoryRounded";
import StatCard from "@/components/StatCard";
import { formatCurrency, formatNumber, formatDate } from "@/lib/format";

const VIEWS = [
  { key: "day", label: "Daily", blurb: "Last 30 days" },
  { key: "week", label: "Weekly", blurb: "Last 12 weeks" },
  { key: "month", label: "Monthly", blurb: "Last 12 months" },
];

const SOURCE_META = {
  new: { label: "New product", color: "primary" },
  restock: { label: "Restock", color: "success" },
  receipt: { label: "Receipt import", color: "secondary" },
  adjustment: { label: "Adjustment", color: "warning" },
};

function bucketLabel(dateStr, bucket) {
  const d = new Date(dateStr);
  if (bucket === "month") {
    return d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
  }
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

export default function InventoryLogPage() {
  const [bucket, setBucket] = useState("day");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (b) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/inventory-log?bucket=${b}`).then((r) => r.json());
      setData(res.data || null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(bucket);
  }, [bucket, load]);

  const totals = data?.totals || { units: 0, cost: 0, entries: 0, products: 0 };
  const series = data?.series || [];
  const bySource = data?.bySource || [];
  const topProducts = data?.topProducts || [];
  const entries = data?.entries || [];
  const view = VIEWS.find((v) => v.key === bucket) || VIEWS[0];

  const chartData = useMemo(
    () => series.map((s) => ({ ...s, label: bucketLabel(s.date, bucket) })),
    [series, bucket]
  );
  const hasData = series.some((s) => s.units > 0);

  const columns = [
    {
      field: "productName",
      headerName: "Item",
      flex: 1.4,
      minWidth: 180,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight={600} noWrap>
            {params.row.productName || "—"}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {params.row.sku || params.row.category || "—"}
          </Typography>
        </Box>
      ),
    },
    {
      field: "quantity",
      headerName: "Added",
      flex: 0.8,
      minWidth: 110,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight={700} color="success.main">
          +{formatNumber(params.row.quantity)} {params.row.unit}
        </Typography>
      ),
    },
    {
      field: "source",
      headerName: "Source",
      flex: 0.9,
      minWidth: 130,
      renderCell: (params) => {
        const m = SOURCE_META[params.row.source] || { label: params.row.source, color: "default" };
        return <Chip size="small" label={m.label} color={m.color} variant="outlined" />;
      },
    },
    {
      field: "totalCost",
      headerName: "Cost value",
      flex: 0.9,
      minWidth: 120,
      valueFormatter: (value) => formatCurrency(value),
    },
    {
      field: "createdAt",
      headerName: "When",
      flex: 1.1,
      minWidth: 170,
      valueFormatter: (value) => formatDate(value),
    },
    {
      field: "userName",
      headerName: "By",
      flex: 0.8,
      minWidth: 110,
      renderCell: (params) => (
        <Typography variant="body2" color="text.secondary">
          {params.row.userName || "—"}
        </Typography>
      ),
    },
  ];

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
          <Typography variant="h4">Inventory Added</Typography>
          <Typography variant="body2" color="text.secondary">
            Stock you added to this store · {view.blurb.toLowerCase()}
          </Typography>
        </Box>
        <ToggleButtonGroup
          size="small"
          exclusive
          value={bucket}
          onChange={(_e, v) => v && setBucket(v)}
          color="primary"
        >
          {VIEWS.map((v) => (
            <ToggleButton key={v.key} value={v.key}>
              {v.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Stack>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      <Grid container spacing={2.5}>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Units Added"
            value={formatNumber(totals.units)}
            icon={<Inventory2RoundedIcon />}
            color="primary"
            sub={view.blurb}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Stock Value Added"
            value={formatCurrency(totals.cost)}
            icon={<PaidRoundedIcon />}
            color="success"
            sub="At cost price"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Entries Logged"
            value={formatNumber(totals.entries)}
            icon={<PlaylistAddCheckRoundedIcon />}
            color="secondary"
            sub="Restock events"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Products Touched"
            value={formatNumber(totals.products)}
            icon={<CategoryRoundedIcon />}
            color="warning"
            sub="Distinct items"
          />
        </Grid>

        <Grid item xs={12} lg={8}>
          <Card sx={{ height: "100%" }}>
            <CardHeader
              title={`Units added per ${bucket}`}
              titleTypographyProps={{ variant: "h6" }}
            />
            <CardContent>
              {hasData ? (
                <BarChart
                  height={320}
                  dataset={chartData}
                  xAxis={[{ scaleType: "band", dataKey: "label" }]}
                  series={[{ dataKey: "units", label: "Units added", color: "#2F7EDA" }]}
                  margin={{ left: 60 }}
                />
              ) : (
                <Box sx={{ py: 6, textAlign: "center" }}>
                  <Typography color="text.secondary">
                    No inventory added in this period yet.
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Card sx={{ height: "100%" }}>
            <CardHeader title="By source" titleTypographyProps={{ variant: "h6" }} />
            <Divider />
            <CardContent sx={{ p: 0 }}>
              {bySource.length === 0 ? (
                <Box sx={{ py: 6, textAlign: "center" }}>
                  <Typography color="text.secondary">No data yet.</Typography>
                </Box>
              ) : (
                <Table size="small">
                  <TableBody>
                    {bySource.map((s) => {
                      const m = SOURCE_META[s.source] || { label: s.source, color: "default" };
                      return (
                        <TableRow key={s.source}>
                          <TableCell>
                            <Chip size="small" label={m.label} color={m.color} variant="outlined" />
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" fontWeight={700}>
                              {formatNumber(s.units)} units
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatCurrency(s.cost)}
                            </Typography>
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

        <Grid item xs={12} lg={4}>
          <Card sx={{ height: "100%" }}>
            <CardHeader title="Most added items" titleTypographyProps={{ variant: "h6" }} />
            <Divider />
            <CardContent sx={{ p: 0 }}>
              {topProducts.length === 0 ? (
                <Box sx={{ py: 6, textAlign: "center" }}>
                  <Typography color="text.secondary">No data yet.</Typography>
                </Box>
              ) : (
                <Table size="small">
                  <TableBody>
                    {topProducts.map((p, i) => (
                      <TableRow key={p.name + i}>
                        <TableCell sx={{ width: 32, color: "text.secondary" }}>{i + 1}</TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600} noWrap>
                            {p.name}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight={700}>
                            {formatNumber(p.units)}
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

        <Grid item xs={12} lg={8}>
          <Card>
            <CardHeader
              title="Recent additions"
              subheader="Every stock addition in this period"
              titleTypographyProps={{ variant: "h6" }}
            />
            <Divider />
            <DataGrid
              rows={entries}
              columns={columns}
              getRowId={(row) => row._id}
              loading={loading}
              disableRowSelectionOnClick
              autoHeight
              rowHeight={58}
              pageSizeOptions={[10, 25, 50]}
              initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
              sx={{
                border: "none",
                "& .MuiDataGrid-columnHeaders": { bgcolor: "background.default" },
                "& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within": {
                  outline: "none",
                },
              }}
            />
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
