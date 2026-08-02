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
  Box,
  Typography,
  IconButton,
} from "@mui/material";
import AddPhotoAlternateRoundedIcon from "@mui/icons-material/AddPhotoAlternateRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import { useBusiness } from "@/components/BusinessContext";

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
  image: "",
};

// Downscale an uploaded image to a small JPEG data URL so it stays light in the
// database and in the product list payload.
async function fileToThumbnail(file, max = 640, quality = 0.72) {
  const dataUrl = await new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.onerror = () => rej(new Error("read failed"));
    r.readAsDataURL(file);
  });
  const img = await new Promise((res, rej) => {
    const i = new window.Image();
    i.onload = () => res(i);
    i.onerror = () => rej(new Error("bad image"));
    i.src = dataUrl;
  });
  const scale = Math.min(1, max / Math.max(img.width, img.height));
  const width = Math.round(img.width * scale);
  const height = Math.round(img.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d").drawImage(img, 0, 0, width, height);
  return canvas.toDataURL("image/jpeg", quality);
}

export default function ProductDialog({ open, onClose, onSaved, product, categories }) {
  const { labels } = useBusiness();
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [imgBusy, setImgBusy] = useState(false);

  const handleImage = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file
    if (!file) return;
    setImgBusy(true);
    setError("");
    try {
      const thumb = await fileToThumbnail(file);
      setForm((f) => ({ ...f, image: thumb }));
    } catch {
      setError("Could not process that image. Try a different file.");
    } finally {
      setImgBusy(false);
    }
  };

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
      <Box
        component="form"
        onSubmit={(e) => {
          e.preventDefault();
          handleSave();
        }}
      >
      <DialogTitle sx={{ fontWeight: 700 }}>
        {product?._id ? `Edit ${labels.Item}` : labels.addItem}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 0 }}>
          <Grid item xs={12}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box
                sx={{
                  width: 72,
                  height: 72,
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "background.default",
                  overflow: "hidden",
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {form.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={form.image}
                    alt="product"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <AddPhotoAlternateRoundedIcon sx={{ color: "text.disabled" }} />
                )}
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Button
                    component="label"
                    size="small"
                    variant="outlined"
                    startIcon={<AddPhotoAlternateRoundedIcon />}
                    disabled={imgBusy}
                  >
                    {imgBusy ? "Processing…" : form.image ? "Change image" : "Upload image"}
                    <input type="file" accept="image/*" hidden onChange={handleImage} />
                  </Button>
                  {form.image && (
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => setForm((f) => ({ ...f, image: "" }))}
                    >
                      <DeleteOutlineRoundedIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                  Optional — shown as the product background in POS
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <TextField
              label={`${labels.Item} name`}
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
        <Button type="submit" variant="contained" disabled={saving}>
          {saving ? "Saving…" : `Save ${labels.Item}`}
        </Button>
      </DialogActions>
      </Box>
    </Dialog>
  );
}
