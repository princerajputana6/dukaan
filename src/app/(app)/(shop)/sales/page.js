"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Chip,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Collapse,
  IconButton,
  TextField,
  InputAdornment,
} from "@mui/material";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import KeyboardArrowUpRoundedIcon from "@mui/icons-material/KeyboardArrowUpRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import PrintRoundedIcon from "@mui/icons-material/PrintRounded";
import IosShareRoundedIcon from "@mui/icons-material/IosShareRounded";
import Tooltip from "@mui/material/Tooltip";
import { formatCurrency, formatDate } from "@/lib/format";
import { printReceipt, shareReceiptPdf } from "@/lib/receipt";

const METHOD_COLOR = {
  cash: "success",
  upi: "primary",
  card: "secondary",
  credit: "warning",
};

export default function SalesPage() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [search, setSearch] = useState("");
  const [meInfo, setMeInfo] = useState(null);

  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then((res) => setMeInfo(res.data || null));
    fetch("/api/sales?limit=200")
      .then((r) => r.json())
      .then((res) => setSales(res.data || []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (!search) return sales;
    const s = search.toLowerCase();
    return sales.filter(
      (x) =>
        x.invoiceNo.toLowerCase().includes(s) ||
        (x.customerName || "").toLowerCase().includes(s)
    );
  }, [sales, search]);

  const totalRevenue = sales.reduce((s, x) => s + x.total, 0);
  const totalProfit = sales.reduce((s, x) => s + x.profit, 0);

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 0.5 }}>
        Sales
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Complete history of invoices
      </Typography>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Total Invoices
              </Typography>
              <Typography variant="h5">{sales.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Total Revenue
              </Typography>
              <Typography variant="h5">{formatCurrency(totalRevenue)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Total Profit
              </Typography>
              <Typography variant="h5" color="success.main">
                {formatCurrency(totalProfit)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ p: 2, mb: 2 }}>
        <TextField
          placeholder="Search by invoice or customer…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
      </Card>

      <Card>
        {loading && <LinearProgress />}
        {!loading && filtered.length === 0 ? (
          <Box sx={{ p: 6, textAlign: "center" }}>
            <Typography color="text.secondary">No sales yet.</Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell width={48} />
                  <TableCell>Invoice</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Payment</TableCell>
                  <TableCell align="right">Items</TableCell>
                  <TableCell align="right">Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((sale) => (
                  <Fragment key={sale._id}>
                    <TableRow hover>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() =>
                            setExpanded(expanded === sale._id ? null : sale._id)
                          }
                        >
                          {expanded === sale._id ? (
                            <KeyboardArrowUpRoundedIcon />
                          ) : (
                            <KeyboardArrowDownRoundedIcon />
                          )}
                        </IconButton>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {sale.invoiceNo}
                        </Typography>
                      </TableCell>
                      <TableCell>{formatDate(sale.createdAt)}</TableCell>
                      <TableCell>{sale.customerName}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={sale.paymentMethod?.toUpperCase()}
                          color={METHOD_COLOR[sale.paymentMethod] || "default"}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">{sale.items.length}</TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="flex-end">
                          <Typography fontWeight={700}>
                            {formatCurrency(sale.total)}
                          </Typography>
                          <Tooltip title="Reprint receipt">
                            <IconButton
                              size="small"
                              onClick={() =>
                                printReceipt(sale, meInfo?.business, meInfo?.store)
                              }
                            >
                              <PrintRoundedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Share / download PDF">
                            <IconButton
                              size="small"
                              onClick={() =>
                                shareReceiptPdf(sale, meInfo?.business, meInfo?.store)
                              }
                            >
                              <IosShareRoundedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ py: 0, border: 0 }} colSpan={7}>
                        <Collapse
                          in={expanded === sale._id}
                          timeout="auto"
                          unmountOnExit
                        >
                          <Box sx={{ py: 2, px: 1 }}>
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell>Product</TableCell>
                                  <TableCell align="right">Qty</TableCell>
                                  <TableCell align="right">Price</TableCell>
                                  <TableCell align="right">Total</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {sale.items.map((it, idx) => (
                                  <TableRow key={idx}>
                                    <TableCell>{it.name}</TableCell>
                                    <TableCell align="right">{it.quantity}</TableCell>
                                    <TableCell align="right">
                                      {formatCurrency(it.price)}
                                    </TableCell>
                                    <TableCell align="right">
                                      {formatCurrency(it.lineTotal)}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                            <Stack
                              direction="row"
                              spacing={3}
                              justifyContent="flex-end"
                              sx={{ mt: 1.5, pr: 1 }}
                            >
                              <Typography variant="body2" color="text.secondary">
                                Discount: {formatCurrency(sale.discount)}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Tax: {formatCurrency(sale.tax)}
                              </Typography>
                              <Typography variant="body2" color="success.main">
                                Profit: {formatCurrency(sale.profit)}
                              </Typography>
                            </Stack>
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>
    </Box>
  );
}
