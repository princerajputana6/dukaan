"use client";

import { useRef, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Stack,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  IconButton,
  Alert,
  Autocomplete,
} from "@mui/material";
import UploadFileRoundedIcon from "@mui/icons-material/UploadFileRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";

const EMPTY_ROW = { name: "", qty: 1, cost: 0, selling: 0, category: "" };

// Read a File as a base64 data URL for upload to the AI scan endpoint.
function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Could not read the file"));
    reader.readAsDataURL(file);
  });
}

export default function ReceiptImportDialog({ open, onClose, onImported, categories = [] }) {
  const fileRef = useRef(null);
  const [status, setStatus] = useState("idle"); // idle | scanning | review | saving
  const [progress, setProgress] = useState(0);
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(null);

  const categoryOptions = categories.map((c) => c.name);

  const reset = () => {
    setStatus("idle");
    setProgress(0);
    setRows([]);
    setError("");
    setPreview(null);
  };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setPreview(URL.createObjectURL(file));
    setStatus("scanning");
    setProgress(0);
    try {
      const image = await fileToDataUrl(file);
      const res = await fetch("/api/products/receipt-scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not read the receipt");
      const parsed = (json.data?.items || []).map((it) => ({
        name: it.name || "",
        qty: Math.max(1, Math.round(Number(it.quantity) || 1)),
        cost: Number(it.costPrice) || 0,
        selling: Number(it.sellingPrice) || Number(it.costPrice) || 0,
        category: it.category && it.category !== "Uncategorized" ? it.category : "",
      }));
      setRows(parsed.length ? parsed : [{ ...EMPTY_ROW }]);
      setStatus("review");
    } catch (err) {
      setError(
        `${err.message}. You can still add items manually below.`
      );
      setRows([{ ...EMPTY_ROW }]);
      setStatus("review");
    }
  };

  const updateRow = (i, key, value) =>
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, [key]: value } : r)));
  const removeRow = (i) => setRows((prev) => prev.filter((_, idx) => idx !== i));
  const addRow = () => setRows((prev) => [...prev, { ...EMPTY_ROW }]);

  const doImport = async () => {
    const items = rows
      .filter((r) => r.name.trim())
      .map((r) => ({
        name: r.name.trim(),
        stock: Number(r.qty) || 0,
        costPrice: Number(r.cost) || 0,
        sellingPrice: Number(r.selling) || Number(r.cost) || 0,
        category: r.category || "Uncategorized",
      }));
    if (items.length === 0) {
      setError("Add at least one item with a name.");
      return;
    }
    setStatus("saving");
    setError("");
    try {
      const res = await fetch("/api/products/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Import failed");
      onImported?.(json.data.count);
      reset();
      onClose();
    } catch (err) {
      setError(err.message);
      setStatus("review");
    }
  };

  const close = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={close} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, display: "flex", alignItems: "center", gap: 1 }}>
        <ReceiptLongRoundedIcon color="primary" />
        Import Inventory from Receipt
      </DialogTitle>
      <DialogContent dividers>
        {error && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {status === "idle" && (
          <Box
            onClick={() => fileRef.current?.click()}
            sx={{
              border: "2px dashed",
              borderColor: "divider",
              borderRadius: 3,
              p: 5,
              textAlign: "center",
              cursor: "pointer",
              "&:hover": { borderColor: "primary.main", bgcolor: "background.default" },
            }}
          >
            <UploadFileRoundedIcon sx={{ fontSize: 48, color: "primary.main", mb: 1 }} />
            <Typography variant="h6">Upload a supplier receipt</Typography>
            <Typography variant="body2" color="text.secondary">
              Take a photo or choose an image. Our AI reads the items, quantities
              and prices so you can review and add them to your inventory.
            </Typography>
          </Box>
        )}

        {status === "scanning" && (
          <Box sx={{ py: 4, textAlign: "center" }}>
            {preview && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={preview}
                alt="receipt"
                style={{ maxHeight: 160, borderRadius: 8, marginBottom: 16 }}
              />
            )}
            <Typography gutterBottom>Reading your receipt with AI…</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              This usually takes a few seconds.
            </Typography>
            <LinearProgress sx={{ maxWidth: 360, mx: "auto" }} />
          </Box>
        )}

        {(status === "review" || status === "saving") && (
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              Review the detected items — edit anything that looks off, then import.
            </Typography>
            <Box sx={{ overflowX: "auto" }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ minWidth: 180 }}>Item name</TableCell>
                    <TableCell sx={{ minWidth: 150 }}>Category</TableCell>
                    <TableCell align="right">Qty</TableCell>
                    <TableCell align="right">Cost ₹</TableCell>
                    <TableCell align="right">Sell ₹</TableCell>
                    <TableCell />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((r, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <TextField
                          size="small"
                          fullWidth
                          value={r.name}
                          onChange={(e) => updateRow(i, "name", e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Autocomplete
                          freeSolo
                          size="small"
                          options={categoryOptions}
                          value={r.category}
                          onChange={(_e, v) => updateRow(i, "category", v || "")}
                          onInputChange={(_e, v) => updateRow(i, "category", v || "")}
                          renderInput={(params) => <TextField {...params} placeholder="Uncategorized" />}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <TextField
                          size="small"
                          type="number"
                          value={r.qty}
                          onChange={(e) => updateRow(i, "qty", e.target.value)}
                          sx={{ width: 70 }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <TextField
                          size="small"
                          type="number"
                          value={r.cost}
                          onChange={(e) => updateRow(i, "cost", e.target.value)}
                          sx={{ width: 80 }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <TextField
                          size="small"
                          type="number"
                          value={r.selling}
                          onChange={(e) => updateRow(i, "selling", e.target.value)}
                          sx={{ width: 80 }}
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton size="small" color="error" onClick={() => removeRow(i)}>
                          <DeleteOutlineRoundedIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
            <Button startIcon={<AddRoundedIcon />} onClick={addRow} sx={{ mt: 1 }}>
              Add row
            </Button>
          </Box>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          hidden
          onChange={handleFile}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button color="inherit" onClick={close}>
          Cancel
        </Button>
        {status === "review" && (
          <Button variant="outlined" onClick={() => fileRef.current?.click()}>
            Choose another image
          </Button>
        )}
        {(status === "review" || status === "saving") && (
          <Button
            variant="contained"
            onClick={doImport}
            disabled={status === "saving"}
          >
            {status === "saving" ? "Importing…" : `Import ${rows.filter((r) => r.name.trim()).length} items`}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
