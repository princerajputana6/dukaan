"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Box,
  Card,
  Typography,
  Stack,
  Chip,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import AddBoxRoundedIcon from "@mui/icons-material/AddBoxRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import { formatCurrency } from "@/lib/format";
import { useBusiness } from "@/components/BusinessContext";

export default function LowStockPage() {
  const { labels } = useBusiness();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/products?lowStock=true").then((r) => r.json());
    const sorted = (res.data || []).sort((a, b) => a.stock - b.stock);
    setItems(sorted);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const restock = async (id) => {
    const amount = prompt("Add stock quantity:");
    if (amount == null) return;
    const res = await fetch(`/api/products/${id}/stock`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "add", amount: Number(amount) }),
    });
    if (res.ok) {
      setToast({ severity: "success", msg: "Stock added" });
      load();
    } else {
      setToast({ severity: "error", msg: "Failed to update" });
    }
  };

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 0.5 }}>
        <WarningAmberRoundedIcon color="warning" />
        <Typography variant="h4">Low Stock</Typography>
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {labels.Item} entries at or below their reorder threshold — restock these soon
      </Typography>

      <Card>
        {loading && <LinearProgress />}
        {!loading && items.length === 0 ? (
          <Box sx={{ p: 6, textAlign: "center" }}>
            <Typography variant="h6" gutterBottom>
              All stocked up 🎉
            </Typography>
            <Typography color="text.secondary">
              No {labels.items} are below their reorder level right now.
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{labels.Item}</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell align="right">In Stock</TableCell>
                  <TableCell align="right">Threshold</TableCell>
                  <TableCell align="right">Value</TableCell>
                  <TableCell align="right">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((p) => {
                  const out = p.stock <= 0;
                  return (
                    <TableRow key={p._id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {p.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {p.sku || "—"}
                        </Typography>
                      </TableCell>
                      <TableCell>{p.category}</TableCell>
                      <TableCell align="right">
                        <Chip
                          size="small"
                          label={`${p.stock} ${p.unit}`}
                          color={out ? "error" : "warning"}
                        />
                      </TableCell>
                      <TableCell align="right">{p.lowStockThreshold}</TableCell>
                      <TableCell align="right">
                        {formatCurrency(p.sellingPrice * p.stock)}
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          size="small"
                          startIcon={<AddBoxRoundedIcon />}
                          onClick={() => restock(p._id)}
                        >
                          Restock
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      <Snackbar
        open={!!toast}
        autoHideDuration={2500}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        {toast ? (
          <Alert severity={toast.severity} onClose={() => setToast(null)}>
            {toast.msg}
          </Alert>
        ) : null}
      </Snackbar>
    </Box>
  );
}
