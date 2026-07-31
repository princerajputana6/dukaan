"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Box,
  Card,
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Checkbox,
  ListItemText,
  Avatar,
  Snackbar,
  Alert,
  LinearProgress,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";

const EMPTY = { name: "", username: "", password: "", stores: [] };

export default function TeamPage() {
  const [managers, setManagers] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [m, s] = await Promise.all([
      fetch("/api/users").then((r) => r.json()),
      fetch("/api/stores").then((r) => r.json()),
    ]);
    setManagers(m.data || []);
    setStores(s.data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openNew = () => {
    setForm(EMPTY);
    setEditing(null);
    setError("");
    setOpen(true);
  };
  const openEdit = (u) => {
    setEditing(u);
    setForm({
      name: u.name,
      username: u.username,
      password: "",
      stores: (u.stores || []).map((s) => s._id || s),
    });
    setError("");
    setOpen(true);
  };

  const save = async () => {
    setError("");
    try {
      if (editing) {
        const body = { name: form.name, stores: form.stores };
        if (form.password) body.password = form.password;
        const res = await fetch(`/api/users/${editing._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error);
      } else {
        const res = await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error);
      }
      setOpen(false);
      setToast({ severity: "success", msg: "Team member saved" });
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  const remove = async (id) => {
    if (!confirm("Remove this team member?")) return;
    const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
    if (res.ok) {
      setToast({ severity: "success", msg: "Team member removed" });
      load();
    }
  };

  const storeName = (id) => stores.find((s) => s._id === id)?.name || "—";

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
          <Typography variant="h4">Team</Typography>
          <Typography variant="body2" color="text.secondary">
            Store managers who can operate your stores
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={openNew}>
          Add Manager
        </Button>
      </Stack>

      <Card>
        {loading && <LinearProgress />}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Username</TableCell>
                <TableCell>Assigned Stores</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {managers.map((u) => (
                <TableRow key={u._id} hover>
                  <TableCell>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Avatar sx={{ bgcolor: "secondary.main", width: 34, height: 34, fontSize: 14 }}>
                        {u.name?.[0]?.toUpperCase()}
                      </Avatar>
                      <Typography variant="body2" fontWeight={600}>
                        {u.name}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>@{u.username}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                      {(u.stores || []).length === 0 ? (
                        <Typography variant="body2" color="text.secondary">
                          None
                        </Typography>
                      ) : (
                        (u.stores || []).map((s) => (
                          <Chip key={s._id || s} size="small" label={s.name || storeName(s)} variant="outlined" />
                        ))
                      )}
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={u.active === false ? "Disabled" : "Active"}
                      color={u.active === false ? "default" : "success"}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => openEdit(u)}>
                      <EditRoundedIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => remove(u._id)}>
                      <DeleteOutlineRoundedIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {!loading && managers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} sx={{ textAlign: "center", py: 5, color: "text.secondary" }}>
                    No managers yet. Add one to delegate store operations.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <Box component="form" onSubmit={(e) => { e.preventDefault(); save(); }}>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editing ? "Edit Manager" : "Add Manager"}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2, mt: 1 }}>
              {error}
            </Alert>
          )}
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Full name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} fullWidth autoFocus required />
            <TextField
              label="Username"
              value={form.username}
              onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
              fullWidth
              required
              disabled={!!editing}
              helperText={editing ? "Username cannot be changed" : ""}
            />
            <TextField
              label={editing ? "New password (leave blank to keep)" : "Password"}
              type="text"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              fullWidth
              required={!editing}
            />
            <FormControl fullWidth>
              <InputLabel>Assigned stores</InputLabel>
              <Select
                multiple
                value={form.stores}
                onChange={(e) => setForm((f) => ({ ...f, stores: e.target.value }))}
                input={<OutlinedInput label="Assigned stores" />}
                renderValue={(selected) => selected.map((id) => storeName(id)).join(", ")}
              >
                {stores.map((s) => (
                  <MenuItem key={s._id} value={s._id}>
                    <Checkbox checked={form.stores.indexOf(s._id) > -1} />
                    <ListItemText primary={s.name} secondary={s.location} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
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
