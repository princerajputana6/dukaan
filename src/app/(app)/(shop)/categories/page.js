"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Stack,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Snackbar,
  Alert,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import CategoryRoundedIcon from "@mui/icons-material/CategoryRounded";

const EMPTY = { name: "", description: "", color: "#2F7EDA" };

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [toast, setToast] = useState(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/categories").then((r) => r.json());
    setCategories(res.data || []);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openNew = () => {
    setForm(EMPTY);
    setEditingId(null);
    setError("");
    setOpen(true);
  };

  const openEdit = (c) => {
    setForm({ name: c.name, description: c.description, color: c.color });
    setEditingId(c._id);
    setError("");
    setOpen(true);
  };

  const save = async () => {
    if (!form.name) {
      setError("Name is required");
      return;
    }
    const url = editingId ? `/api/categories/${editingId}` : "/api/categories";
    const method = editingId ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const json = await res.json();
    if (!res.ok) {
      setError(json.error || "Failed to save");
      return;
    }
    setOpen(false);
    setToast({ severity: "success", msg: "Category saved" });
    load();
  };

  const remove = async (id) => {
    if (!confirm("Delete this category?")) return;
    await fetch(`/api/categories/${id}`, { method: "DELETE" });
    setToast({ severity: "success", msg: "Category deleted" });
    load();
  };

  const COLORS = ["#2F7EDA", "#2E9E6B", "#E0A23B", "#D9534F", "#9FA0B5", "#555663"];

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
          <Typography variant="h4">Categories</Typography>
          <Typography variant="body2" color="text.secondary">
            Organise your products into groups
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={openNew}>
          Add Category
        </Button>
      </Stack>

      <Grid container spacing={2}>
        {categories.map((c) => (
          <Grid item xs={12} sm={6} md={4} key={c._id}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="flex-start" spacing={1.5}>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: 2,
                      bgcolor: c.color || "#2F7EDA",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                    }}
                  >
                    <CategoryRoundedIcon />
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="subtitle1" noWrap>
                      {c.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {c.description || "No description"}
                    </Typography>
                    <Chip
                      size="small"
                      label={`${c.productCount} products`}
                      sx={{ mt: 1 }}
                      variant="outlined"
                    />
                  </Box>
                  <Stack>
                    <IconButton size="small" onClick={() => openEdit(c)}>
                      <EditRoundedIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => remove(c._id)}>
                      <DeleteOutlineRoundedIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
        {categories.length === 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent sx={{ textAlign: "center", py: 6 }}>
                <Typography color="text.secondary">
                  No categories yet. Add your first one.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editingId ? "Edit Category" : "Add Category"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              fullWidth
              autoFocus
              error={!!error}
              helperText={error}
            />
            <TextField
              label="Description"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              fullWidth
              multiline
              rows={2}
            />
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Color
              </Typography>
              <Stack direction="row" spacing={1}>
                {COLORS.map((col) => (
                  <Box
                    key={col}
                    onClick={() => setForm((f) => ({ ...f, color: col }))}
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      bgcolor: col,
                      cursor: "pointer",
                      border: form.color === col ? "3px solid #555663" : "3px solid transparent",
                    }}
                  />
                ))}
              </Stack>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button color="inherit" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant="contained" onClick={save}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

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
