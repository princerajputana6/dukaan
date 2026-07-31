"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
  MenuItem,
  Chip,
  Snackbar,
  Alert,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import CategoryRoundedIcon from "@mui/icons-material/CategoryRounded";
import SubdirectoryArrowRightRoundedIcon from "@mui/icons-material/SubdirectoryArrowRightRounded";
import { useBusiness } from "@/components/BusinessContext";

const EMPTY = { name: "", description: "", color: "#2F7EDA", parent: "" };
const COLORS = ["#2F7EDA", "#2E9E6B", "#E0A23B", "#D9534F", "#9FA0B5", "#555663"];

export default function CategoriesPage() {
  const { labels } = useBusiness();
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

  const topLevel = useMemo(() => categories.filter((c) => !c.parent), [categories]);
  const childrenOf = useMemo(() => {
    const map = {};
    for (const c of categories) {
      if (c.parent) {
        const key = String(c.parent);
        (map[key] = map[key] || []).push(c);
      }
    }
    return map;
  }, [categories]);

  const openNew = () => {
    setForm(EMPTY);
    setEditingId(null);
    setError("");
    setOpen(true);
  };

  const openEdit = (c) => {
    setForm({
      name: c.name,
      description: c.description || "",
      color: c.color || "#2F7EDA",
      parent: c.parent ? String(c.parent) : "",
    });
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
      body: JSON.stringify({ ...form, parent: form.parent || null }),
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

  // A category that already has children can't itself become a sub-category.
  const editingHasChildren = editingId && (childrenOf[String(editingId)] || []).length > 0;
  const parentOptions = topLevel.filter((c) => String(c._id) !== String(editingId));

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
            Organise {labels.items} into categories and sub-categories
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={openNew}>
          Add Category
        </Button>
      </Stack>

      <Grid container spacing={2}>
        {topLevel.map((c) => {
          const kids = childrenOf[String(c._id)] || [];
          return (
            <Grid item xs={12} sm={6} md={4} key={c._id}>
              <Card sx={{ height: "100%" }}>
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
                      <Stack direction="row" spacing={0.75} sx={{ mt: 1 }} flexWrap="wrap" useFlexGap>
                        <Chip size="small" label={`${c.productCount} ${labels.items}`} variant="outlined" />
                        {kids.length > 0 && (
                          <Chip size="small" label={`${kids.length} sub`} color="primary" variant="outlined" />
                        )}
                      </Stack>
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

                  {kids.length > 0 && (
                    <Stack spacing={0.5} sx={{ mt: 1.5 }}>
                      {kids.map((k) => (
                        <Stack
                          key={k._id}
                          direction="row"
                          alignItems="center"
                          spacing={1}
                          sx={{ py: 0.5, pl: 1, borderLeft: "2px solid", borderColor: "divider" }}
                        >
                          <SubdirectoryArrowRightRoundedIcon
                            fontSize="small"
                            sx={{ color: "text.secondary" }}
                          />
                          <Typography variant="body2" sx={{ flex: 1 }} noWrap>
                            {k.name}
                          </Typography>
                          <Chip size="small" label={k.productCount} variant="outlined" />
                          <IconButton size="small" onClick={() => openEdit(k)}>
                            <EditRoundedIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                          <IconButton size="small" color="error" onClick={() => remove(k._id)}>
                            <DeleteOutlineRoundedIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Stack>
                      ))}
                    </Stack>
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
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
        <Box
          component="form"
          onSubmit={(e) => {
            e.preventDefault();
            save();
          }}
        >
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
                select
                label="Parent category (optional)"
                value={form.parent}
                onChange={(e) => setForm((f) => ({ ...f, parent: e.target.value }))}
                fullWidth
                disabled={editingHasChildren}
                helperText={
                  editingHasChildren
                    ? "This category has sub-categories, so it can't become one."
                    : "Leave blank for a top-level category"
                }
              >
                <MenuItem value="">
                  <em>None (top-level)</em>
                </MenuItem>
                {parentOptions.map((c) => (
                  <MenuItem key={c._id} value={String(c._id)}>
                    {c.name}
                  </MenuItem>
                ))}
              </TextField>
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
                        border:
                          form.color === col ? "3px solid #555663" : "3px solid transparent",
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
            <Button type="submit" variant="contained">
              Save
            </Button>
          </DialogActions>
        </Box>
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
