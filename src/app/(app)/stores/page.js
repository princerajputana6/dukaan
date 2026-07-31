"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Card,
  CardContent,
  Grid,
  Stack,
  Typography,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  LinearProgress,
  Snackbar,
  Alert,
  Tooltip,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import StoreMallDirectoryRoundedIcon from "@mui/icons-material/StoreMallDirectoryRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";

const EMPTY = { name: "", code: "", location: "", phone: "" };

export default function StoresPage() {
  const router = useRouter();
  const [stores, setStores] = useState([]);
  const [meta, setMeta] = useState({ storeLimit: 1, used: 0, plan: "starter" });
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/stores").then((r) => r.json());
    setStores(res.data || []);
    if (res.meta) setMeta(res.meta);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const limitReached = meta.used >= meta.storeLimit;

  const openNew = () => {
    setForm(EMPTY);
    setEditing(null);
    setError("");
    setOpen(true);
  };
  const openEdit = (s) => {
    setEditing(s);
    setForm({ name: s.name, code: s.code || "", location: s.location || "", phone: s.phone || "" });
    setError("");
    setOpen(true);
  };

  const save = async () => {
    setError("");
    try {
      const url = editing ? `/api/stores/${editing._id}` : "/api/stores";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setOpen(false);
      setToast({ severity: "success", msg: "Store saved" });
      load();
      router.refresh();
    } catch (e) {
      setError(e.message);
    }
  };

  const remove = async (id) => {
    if (!confirm("Delete this store?")) return;
    const res = await fetch(`/api/stores/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (res.ok) {
      setToast({ severity: "success", msg: "Store deleted" });
      load();
      router.refresh();
    } else {
      setToast({ severity: "error", msg: json.error });
    }
  };

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
          <Typography variant="h4">Stores</Typography>
          <Typography variant="body2" color="text.secondary">
            Using {meta.used} of {meta.storeLimit} stores on the{" "}
            <strong>{meta.plan}</strong> plan
          </Typography>
        </Box>
        <Tooltip title={limitReached ? "Store limit reached — request an upgrade" : ""}>
          <span>
            <Button
              variant="contained"
              startIcon={<AddRoundedIcon />}
              onClick={openNew}
              disabled={limitReached}
            >
              Add Store
            </Button>
          </span>
        </Tooltip>
      </Stack>

      {limitReached && (
        <Alert
          severity="info"
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" size="small" onClick={() => router.push("/plan")}>
              Request Upgrade
            </Button>
          }
        >
          You have reached your plan&apos;s store limit. Request a plan upgrade to add more stores.
        </Alert>
      )}

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      <Grid container spacing={2}>
        {stores.map((s) => (
          <Grid item xs={12} sm={6} md={4} key={s._id}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Stack direction="row" spacing={1.5} alignItems="flex-start">
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: 2,
                      bgcolor: "primary.main",
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <StoreMallDirectoryRoundedIcon />
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="subtitle1" noWrap>
                      {s.name}
                    </Typography>
                    {s.code && (
                      <Chip size="small" label={s.code} variant="outlined" sx={{ mt: 0.5 }} />
                    )}
                  </Box>
                  <Stack>
                    <IconButton size="small" onClick={() => openEdit(s)}>
                      <EditRoundedIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => remove(s._id)}>
                      <DeleteOutlineRoundedIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </Stack>
                {(s.location || s.phone) && (
                  <Stack spacing={0.5} sx={{ mt: 1.5 }}>
                    {s.location && (
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <LocationOnRoundedIcon fontSize="small" sx={{ color: "text.secondary" }} />
                        <Typography variant="body2" color="text.secondary">
                          {s.location}
                        </Typography>
                      </Stack>
                    )}
                    {s.phone && (
                      <Typography variant="body2" color="text.secondary">
                        {s.phone}
                      </Typography>
                    )}
                  </Stack>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
        {!loading && stores.length === 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent sx={{ textAlign: "center", py: 6 }}>
                <StoreMallDirectoryRoundedIcon sx={{ fontSize: 40, color: "text.secondary" }} />
                <Typography color="text.secondary" sx={{ mt: 1 }}>
                  No stores yet. Add your first store to start selling.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <Box component="form" onSubmit={(e) => { e.preventDefault(); save(); }}>
        <DialogTitle sx={{ fontWeight: 700 }}>{editing ? "Edit Store" : "Add Store"}</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2, mt: 1 }}>
              {error}
            </Alert>
          )}
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Store name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} fullWidth autoFocus required />
            <TextField label="Store code (optional)" value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} fullWidth />
            <TextField label="Location / area" value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} fullWidth />
            <TextField label="Phone" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} fullWidth />
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
