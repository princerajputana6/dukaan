"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
  MenuItem,
  Divider,
  IconButton,
  Snackbar,
  Alert,
  Menu,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import StoreMallDirectoryRoundedIcon from "@mui/icons-material/StoreMallDirectoryRounded";
import GroupRoundedIcon from "@mui/icons-material/GroupRounded";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import BlockRoundedIcon from "@mui/icons-material/BlockRounded";
import PlayCircleOutlineRoundedIcon from "@mui/icons-material/PlayCircleOutlineRounded";

const PLAN_LIMITS = { starter: 1, growth: 3, enterprise: 10 };
const EMPTY = {
  name: "",
  ownerName: "",
  email: "",
  phone: "",
  address: "",
  plan: "starter",
  storeLimit: 1,
  username: "",
  password: "",
  type: "retail",
  gstin: "",
  fssai: "",
  gstRate: 0,
};

function slugify(str) {
  return (str || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 20);
}

function planForStoreCount(n) {
  if (n <= 1) return { plan: "starter", storeLimit: 1 };
  if (n <= 3) return { plan: "growth", storeLimit: 3 };
  return { plan: "enterprise", storeLimit: Math.max(n, 10) };
}

function BusinessesPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState(null);
  const [toast, setToast] = useState(null);
  const [onboardingId, setOnboardingId] = useState(null);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuBiz, setMenuBiz] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/businesses").then((r) => r.json());
    setBusinesses(res.data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Pre-fill the onboarding form from an account request (?onboard=<id>).
  useEffect(() => {
    const id = searchParams.get("onboard");
    if (!id) return;
    (async () => {
      const res = await fetch("/api/account-requests").then((r) => r.json());
      const req = (res.data || []).find((r) => r._id === id);
      if (!req) return;
      const { plan, storeLimit } = planForStoreCount(Number(req.storeCount) || 1);
      const suggestedUser = slugify(req.businessName || req.ownerName);
      const suggestedPw = `${slugify(req.ownerName).split("-")[0] || "owner"}${Math.floor(
        1000 + Math.random() * 9000
      )}`;
      setEditing(null);
      setForm({
        name: req.businessName,
        ownerName: req.ownerName,
        email: req.email || "",
        phone: req.phone || "",
        address: "",
        plan,
        storeLimit,
        username: suggestedUser,
        password: suggestedPw,
      });
      setOnboardingId(id);
      setError("");
      setOpen(true);
    })();
  }, [searchParams]);

  const openNew = () => {
    setForm(EMPTY);
    setEditing(null);
    setOnboardingId(null);
    setError("");
    setOpen(true);
  };

  const closeDialog = () => {
    setOpen(false);
    if (onboardingId) {
      setOnboardingId(null);
      router.replace("/admin/businesses");
    }
  };

  const openEdit = (b) => {
    setEditing(b);
    setForm({
      name: b.name,
      ownerName: b.ownerName,
      email: b.email || "",
      phone: b.phone || "",
      address: b.address || "",
      plan: b.plan,
      storeLimit: b.storeLimit,
      type: b.type || "retail",
      gstin: b.gstin || "",
      fssai: b.fssai || "",
      gstRate: b.gstRate || 0,
    });
    setError("");
    setOpen(true);
  };

  const set = (k) => (e) => {
    const v = e.target.value;
    setForm((f) => {
      const next = { ...f, [k]: v };
      if (k === "plan" && !editing) next.storeLimit = PLAN_LIMITS[v] || 1;
      // Suggest a sensible GST rate when switching business type.
      if (k === "type") next.gstRate = v === "food" ? 5 : 0;
      return next;
    });
  };

  const save = async () => {
    setError("");
    setSaving(true);
    try {
      if (editing) {
        const res = await fetch(`/api/businesses/${editing._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            ownerName: form.ownerName,
            email: form.email,
            phone: form.phone,
            address: form.address,
            plan: form.plan,
            storeLimit: Number(form.storeLimit),
            type: form.type,
            gstin: form.gstin,
            fssai: form.fssai,
            gstRate: Number(form.gstRate) || 0,
          }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error);
        setToast({ severity: "success", msg: "Business updated" });
      } else {
        const res = await fetch("/api/businesses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, storeLimit: Number(form.storeLimit) }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error);
        setCreated({ username: form.username, password: form.password, name: form.name });
        // If this came from an account request, mark it approved and clear the URL.
        if (onboardingId) {
          await fetch(`/api/account-requests/${onboardingId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "approved" }),
          });
          setOnboardingId(null);
          router.replace("/admin/businesses");
        }
      }
      setOpen(false);
      load();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const openMenu = (e, b) => {
    setMenuAnchor(e.currentTarget);
    setMenuBiz(b);
  };
  const closeMenu = () => {
    setMenuAnchor(null);
    setMenuBiz(null);
  };

  const toggleStatus = async () => {
    const b = menuBiz;
    closeMenu();
    const nextStatus = b.status === "active" ? "suspended" : "active";
    const res = await fetch(`/api/businesses/${b._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });
    if (res.ok) {
      setToast({
        severity: "success",
        msg: nextStatus === "suspended" ? "Business suspended" : "Business reactivated",
      });
      load();
    } else {
      setToast({ severity: "error", msg: "Could not update status" });
    }
  };

  const removeBusiness = async () => {
    const b = menuBiz;
    closeMenu();
    if (
      !confirm(
        `Permanently delete "${b.name}"?\n\nThis removes its stores, staff, products and sales. This cannot be undone.`
      )
    )
      return;
    const res = await fetch(`/api/businesses/${b._id}`, { method: "DELETE" });
    if (res.ok) {
      setToast({ severity: "success", msg: "Business deleted" });
      load();
    } else {
      const json = await res.json();
      setToast({ severity: "error", msg: json.error || "Could not delete" });
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
          <Typography variant="h4">Businesses</Typography>
          <Typography variant="body2" color="text.secondary">
            {businesses.length} shop owners on the platform
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={openNew}>
          Onboard Business
        </Button>
      </Stack>

      <Grid container spacing={2}>
        {businesses.map((b) => (
          <Grid item xs={12} md={6} lg={4} key={b._id}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Stack direction="row" spacing={1.5} alignItems="flex-start">
                  <Avatar />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography variant="subtitle1" noWrap>
                        {b.name}
                      </Typography>
                      <Chip
                        size="small"
                        label={b.status}
                        color={b.status === "active" ? "success" : "warning"}
                        variant={b.status === "active" ? "outlined" : "filled"}
                      />
                    </Stack>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {b.ownerName}
                    </Typography>
                    {b.owner && (
                      <Typography variant="caption" color="text.secondary">
                        Login: @{b.owner.username}
                      </Typography>
                    )}
                  </Box>
                  <IconButton size="small" onClick={(e) => openMenu(e, b)}>
                    <MoreVertRoundedIcon fontSize="small" />
                  </IconButton>
                </Stack>

                <Divider sx={{ my: 1.5 }} />

                <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
                  <Chip
                    size="small"
                    label={b.plan?.toUpperCase()}
                    color="primary"
                    variant="outlined"
                  />
                </Stack>

                <Stack direction="row" spacing={3}>
                  <Stat
                    icon={<StoreMallDirectoryRoundedIcon fontSize="small" />}
                    label="Stores"
                    value={`${b.storeCount} / ${b.storeLimit}`}
                  />
                  <Stat
                    icon={<GroupRoundedIcon fontSize="small" />}
                    label="Users"
                    value={b.userCount}
                  />
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
        {!loading && businesses.length === 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent sx={{ textAlign: "center", py: 6 }}>
                <BusinessRoundedIcon sx={{ fontSize: 40, color: "text.secondary" }} />
                <Typography color="text.secondary" sx={{ mt: 1 }}>
                  No businesses yet. Onboard your first shop owner.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Per-business actions menu */}
      <Menu anchorEl={menuAnchor} open={!!menuAnchor} onClose={closeMenu}>
        <MenuItem
          onClick={() => {
            const b = menuBiz;
            closeMenu();
            openEdit(b);
          }}
        >
          <ListItemIcon>
            <EditRoundedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit / manage plan</ListItemText>
        </MenuItem>
        <MenuItem onClick={toggleStatus}>
          <ListItemIcon>
            {menuBiz?.status === "active" ? (
              <BlockRoundedIcon fontSize="small" />
            ) : (
              <PlayCircleOutlineRoundedIcon fontSize="small" />
            )}
          </ListItemIcon>
          <ListItemText>
            {menuBiz?.status === "active" ? "Suspend business" : "Reactivate business"}
          </ListItemText>
        </MenuItem>
        <MenuItem onClick={removeBusiness} sx={{ color: "error.main" }}>
          <ListItemIcon>
            <DeleteOutlineRoundedIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete business</ListItemText>
        </MenuItem>
      </Menu>

      {/* Create / edit dialog */}
      <Dialog open={open} onClose={closeDialog} maxWidth="sm" fullWidth>
        <Box component="form" onSubmit={(e) => { e.preventDefault(); if (!saving) save(); }}>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editing ? "Edit Business & Plan" : "Onboard New Business"}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2, mt: 1 }}>
              {error}
            </Alert>
          )}
          <Grid container spacing={2} sx={{ mt: 0 }}>
            <Grid item xs={12} sm={6}>
              <TextField label="Business name" value={form.name} onChange={set("name")} fullWidth required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Owner name" value={form.ownerName} onChange={set("ownerName")} fullWidth required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Email" value={form.email} onChange={set("email")} fullWidth />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Phone" value={form.phone} onChange={set("phone")} fullWidth />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Address" value={form.address} onChange={set("address")} fullWidth />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField select label="Plan" value={form.plan} onChange={set("plan")} fullWidth>
                <MenuItem value="starter">Starter — 1 store</MenuItem>
                <MenuItem value="growth">Growth — 3 stores</MenuItem>
                <MenuItem value="enterprise">Enterprise — 10 stores</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Store limit"
                type="number"
                value={form.storeLimit}
                onChange={set("storeLimit")}
                fullWidth
                helperText="Max stores the owner can create"
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 0.5 }}>
                <Typography variant="caption" color="text.secondary">
                  BUSINESS TYPE & TAX
                </Typography>
              </Divider>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField select label="Business type" value={form.type} onChange={set("type")} fullWidth>
                <MenuItem value="retail">Retail shop</MenuItem>
                <MenuItem value="food">Food / Restaurant</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="GST rate %"
                type="number"
                value={form.gstRate}
                onChange={set("gstRate")}
                fullWidth
                helperText="0 = no GST on receipts"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="GSTIN (optional)" value={form.gstin} onChange={set("gstin")} fullWidth />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="FSSAI licence (optional)"
                value={form.fssai}
                onChange={set("fssai")}
                fullWidth
              />
            </Grid>

            {!editing && (
              <>
                <Grid item xs={12}>
                  <Divider sx={{ my: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">
                      OWNER LOGIN CREDENTIALS
                    </Typography>
                  </Divider>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="Username" value={form.username} onChange={set("username")} fullWidth required />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="Password" value={form.password} onChange={set("password")} fullWidth required />
                </Grid>
              </>
            )}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button color="inherit" onClick={closeDialog}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={saving}>
            {saving ? "Saving…" : editing ? "Save Changes" : "Create Business"}
          </Button>
        </DialogActions>
        </Box>
      </Dialog>

      {/* Credentials confirmation */}
      <Dialog open={!!created} onClose={() => setCreated(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Business Created</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Share these login credentials with the owner of{" "}
            <strong>{created?.name}</strong>:
          </Typography>
          <Box
            sx={{
              bgcolor: "background.default",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
              p: 2,
              mt: 1,
            }}
          >
            <Typography variant="body2">
              Username: <strong>{created?.username}</strong>
            </Typography>
            <Typography variant="body2">
              Password: <strong>{created?.password}</strong>
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={() => setCreated(null)}>
            Done
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

function Stat({ icon, label, value }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
      <Box sx={{ color: "text.secondary", display: "flex" }}>{icon}</Box>
      <Box>
        <Typography variant="body2" fontWeight={700} sx={{ lineHeight: 1 }}>
          {value}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
      </Box>
    </Box>
  );
}

function Avatar() {
  return (
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
        flexShrink: 0,
      }}
    >
      <BusinessRoundedIcon />
    </Box>
  );
}

export default function BusinessesPage() {
  return (
    <Suspense>
      <BusinessesPageInner />
    </Suspense>
  );
}
