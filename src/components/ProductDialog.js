"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
  MenuItem,
  Button,
  Autocomplete,
} from "@mui/material";

const UNITS = ["pcs", "pack", "box", "kg", "gm", "ltr", "ml", "strip"];

const EMPTY = {
  name: "",
  sku: "",
  barcode: "",
  category: "Uncategorized",
  unit: "pcs",
  costPrice: "",
  sellingPrice: "",
  stock: "",
  lowStockThreshold: 10,
  supplier: "",
};

export default function ProductDialog({ open, onClose, onSaved, product, categories }) {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (product) {
      setForm({ ...EMPTY, ...product });
    } else {
      setForm(EMPTY);
    }
    setError("");
  }, [product, open]);

  const set = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSave = async () => {
    setError("");
    if (!form.name || form.sellingPrice === "") {
      setError("Name and selling price are required.");
      return;
    }
    setSaving(true);
    const payload = {
      ...form,
      costPrice: Number(form.costPrice || 0),
      sellingPrice: Number(form.sellingPrice || 0),
      stock: Number(form.stock || 0),
      lowStockThreshold: Number(form.lowStockThreshold || 0),
    };
    try {
      const url = product?._id
        ? `/api/products/${product._id}`
        : "/api/products";
      const method = product?._id ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to save");
      onSaved(json.data);
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const categoryOptions = categories.map((c) => c.name);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>
        {product?._id ? "Edit Product" : "Add Product"}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 0 }}>
          <Grid item xs={12}>
            <TextField
              label="Product name"
              value={form.name}
              onChange={set("name")}
              fullWidth
              required
              autoFocus
            />
          </Grid>
          <Grid item xs={6}>
            <TextField label="SKU / Code" value={form.sku} onChange={set("sku")} fullWidth />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Barcode"
              value={form.barcode}
              onChange={set("barcode")}
              fullWidth
            />
          </Grid>
          <Grid item xs={6}>
            <Autocomplete
              freeSolo
              options={categoryOptions}
              value={form.category}
              onChange={(_e, v) => setForm((f) => ({ ...f, category: v || "Uncategorized" }))}
              onInputChange={(_e, v) => setForm((f) => ({ ...f, category: v || "Uncategorized" }))}
              renderInput={(params) => (
                <TextField {...params} label="Category" fullWidth />
              )}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              select
              label="Unit"
              value={form.unit}
              onChange={set("unit")}
              fullWidth
            >
              {UNITS.map((u) => (
                <MenuItem key={u} value={u}>
                  {u}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Cost price"
              type="number"
              value={form.costPrice}
              onChange={set("costPrice")}
              fullWidth
              InputProps={{ startAdornment: "₹" }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Selling price"
              type="number"
              value={form.sellingPrice}
              onChange={set("sellingPrice")}
              fullWidth
              required
              InputProps={{ startAdornment: "₹" }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Stock quantity"
              type="number"
              value={form.stock}
              onChange={set("stock")}
              fullWidth
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Low stock alert at"
              type="number"
              value={form.lowStockThreshold}
              onChange={set("lowStockThreshold")}
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Supplier (optional)"
              value={form.supplier}
              onChange={set("supplier")}
              fullWidth
            />
          </Grid>
          {error && (
            <Grid item xs={12}>
              <TextField
                error
                value={error}
                fullWidth
                variant="standard"
                InputProps={{ readOnly: true, disableUnderline: true }}
              />
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button onClick={handleSave} variant="contained" disabled={saving}>
          {saving ? "Saving…" : "Save Product"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
