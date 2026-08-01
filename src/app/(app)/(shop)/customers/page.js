"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Box,
  Card,
  Stack,
  Typography,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Avatar,
  LinearProgress,
  Snackbar,
  Alert,
  Divider,
} from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import { formatCurrency, formatDate, formatNumber } from "@/lib/format";

const EMPTY = { name: "", phone: "", email: "", note: "" };

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [detail, setDetail] = useState(null);
  const [toast, setToast] = useState(null);

  const load = useCallback(async (q = "") => {
    setLoading(true);
    const res = await fetch(`/api/customers${q ? `?q=${encodeURIComponent(q)}` : ""}`).then((r) => r.json());
    setCustomers(res.data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const t = setTimeout(() => load(search), 300);
    return () => clearTimeout(t);
  }, [search, load]);

  const openNew = () => {
    setForm(EMPTY);
    setEditingId(null);
    setError("");
    setOpen(true);
  };
  const openEdit = (c) => {
    setForm({ name: c.name, phone: c.phone || "", email: c.email || "", note: c.note || "" });
    setEditingId(c._id);
    setError("");
    setOpen(true);
  };

  const save = async () => {
    setError("");
    if (!form.name) {
      setError("Name is required");
      return;
    }
    const url = editingId ? `/api/customers/${editingId}` : "/api/customers";
    const res = await fetch(url, {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const json = await res.json();
    if (!res.ok) {
      setError(json.error);
      return;
    }
    setOpen(false);
    setToast({ severity: "success", msg: "Customer saved" });
    load(search);
  };

  const remove = async (id) => {
    if (!confirm("Remove this customer?")) return;
    await fetch(`/api/customers/${id}`, { method: "DELETE" });
    setToast({ severity: "success", msg: "Customer removed" });
    load(search);
  };

  const viewDetail = async (id) => {
    const res = await fetch(`/api/customers/${id}`).then((r) => r.json());
    setDetail(res.data);
  };

  return (
    <Box>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} spacing={1.5} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4">Customers</Typography>
          <Typography variant="body2" color="text.secondary">
            {customers.length} customers · track visits and loyalty points
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={openNew}>
          Add Customer
        </Button>
      </Stack>

      <Card sx={{ p: 2, mb: 2 }}>
        <TextField
          placeholder="Search by name or phone…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          fullWidth
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchRoundedIcon fontSize="small" /></InputAdornment> }}
        />
      </Card>

      <Card>
        {loading && <LinearProgress />}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Customer</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell align="right">Points</TableCell>
                <TableCell align="right">Total spent</TableCell>
                <TableCell align="right">Visits</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {customers.map((c) => (
                <TableRow key={c._id} hover sx={{ cursor: "pointer" }} onClick={() => viewDetail(c._id)}>
                  <TableCell>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Avatar sx={{ bgcolor: "secondary.main", width: 34, height: 34, fontSize: 14 }}>
                        {c.name?.[0]?.toUpperCase()}
                      </Avatar>
                      <Typography variant="body2" fontWeight={600}>{c.name}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>{c.phone || "—"}</TableCell>
                  <TableCell align="right">
                    <Chip size="small" icon={<StarRoundedIcon />} label={formatNumber(c.points)} color="warning" variant="outlined" />
                  </TableCell>
                  <TableCell align="right">{formatCurrency(c.totalSpent)}</TableCell>
                  <TableCell align="right">{formatNumber(c.visits)}</TableCell>
                  <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                    <IconButton size="small" onClick={() => openEdit(c)}>
                      <EditRoundedIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => remove(c._id)}>
                      <DeleteOutlineRoundedIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {!loading && customers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} sx={{ textAlign: "center", py: 6, color: "text.secondary" }}>
                    <PeopleAltRoundedIcon sx={{ fontSize: 40, opacity: 0.4 }} />
                    <Typography sx={{ mt: 1 }}>No customers yet. Add one or capture them at the POS.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Add / edit dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <Box component="form" onSubmit={(e) => { e.preventDefault(); save(); }}>
          <DialogTitle sx={{ fontWeight: 700 }}>{editingId ? "Edit Customer" : "Add Customer"}</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField label="Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} fullWidth autoFocus required error={!!error} helperText={error} />
              <TextField label="Phone" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} fullWidth />
              <TextField label="Email (optional)" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} fullWidth />
              <TextField label="Note (optional)" value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} fullWidth multiline rows={2} />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button color="inherit" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Save</Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Detail dialog */}
      <Dialog open={!!detail} onClose={() => setDetail(null)} maxWidth="sm" fullWidth>
        {detail && (
          <>
            <DialogTitle sx={{ fontWeight: 700 }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Avatar sx={{ bgcolor: "secondary.main" }}>{detail.name?.[0]?.toUpperCase()}</Avatar>
                <Box>
                  <Typography variant="h6">{detail.name}</Typography>
                  <Typography variant="caption" color="text.secondary">{detail.phone || "No phone"}</Typography>
                </Box>
              </Stack>
            </DialogTitle>
            <DialogContent dividers>
              <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                <StatBox label="Points" value={formatNumber(detail.points)} color="warning.main" />
                <StatBox label="Total spent" value={formatCurrency(detail.totalSpent)} color="primary.main" />
                <StatBox label="Visits" value={formatNumber(detail.visits)} color="success.main" />
              </Stack>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Recent purchases</Typography>
              <Divider sx={{ mb: 1 }} />
              {(detail.sales || []).length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>No purchases yet.</Typography>
              ) : (
                detail.sales.map((s) => (
                  <Box key={s._id} sx={{ display: "flex", justifyContent: "space-between", py: 1, borderBottom: "1px solid", borderColor: "divider" }}>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>{s.invoiceNo}</Typography>
                      <Typography variant="caption" color="text.secondary">{formatDate(s.createdAt)} · {s.items.length} items</Typography>
                    </Box>
                    <Typography fontWeight={700}>{formatCurrency(s.total)}</Typography>
                  </Box>
                ))
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetail(null)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      <Snackbar open={!!toast} autoHideDuration={2500} onClose={() => setToast(null)} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
        {toast ? <Alert severity={toast.severity} onClose={() => setToast(null)}>{toast.msg}</Alert> : null}
      </Snackbar>
    </Box>
  );
}

function StatBox({ label, value, color }) {
  return (
    <Box sx={{ flex: 1, p: 1.5, borderRadius: 2, bgcolor: "background.default", border: "1px solid", borderColor: "divider", textAlign: "center" }}>
      <Typography variant="h6" fontWeight={800} color={color}>{value}</Typography>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
    </Box>
  );
}
