"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Stack,
  Typography,
  Button,
  Chip,
  Divider,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Snackbar,
  Alert,
} from "@mui/material";
import WorkspacePremiumRoundedIcon from "@mui/icons-material/WorkspacePremiumRounded";
import { formatDate } from "@/lib/format";

const PLAN_INFO = {
  starter: { label: "Starter", stores: 1, blurb: "Perfect for a single shop" },
  growth: { label: "Growth", stores: 3, blurb: "For owners running a few outlets" },
  enterprise: { label: "Enterprise", stores: 10, blurb: "Scale across many locations" },
};

const STATUS_COLOR = { pending: "warning", approved: "success", rejected: "default" };

export default function PlanPage() {
  const [meta, setMeta] = useState({ storeLimit: 1, used: 0, plan: "starter" });
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [requestedLimit, setRequestedLimit] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [s, u] = await Promise.all([
      fetch("/api/stores").then((r) => r.json()),
      fetch("/api/upgrade-requests").then((r) => r.json()),
    ]);
    if (s.meta) setMeta(s.meta);
    setRequests(u.data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const hasPending = requests.some((r) => r.status === "pending");

  const submit = async () => {
    setError("");
    try {
      const res = await fetch("/api/upgrade-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestedLimit: Number(requestedLimit), reason }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setOpen(false);
      setRequestedLimit("");
      setReason("");
      setToast({ severity: "success", msg: "Upgrade request sent to admin" });
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  const info = PLAN_INFO[meta.plan] || PLAN_INFO.starter;
  const usagePct = Math.min(100, (meta.used / meta.storeLimit) * 100);

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 0.5 }}>
        Plan & Billing
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Your current plan and store allowance
      </Typography>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      <Grid container spacing={2.5}>
        <Grid item xs={12} md={5}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    bgcolor: "primary.main",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <WorkspacePremiumRoundedIcon />
                </Box>
                <Box>
                  <Typography variant="h6">{info.label} Plan</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {info.blurb}
                  </Typography>
                </Box>
              </Stack>

              <Divider sx={{ mb: 2 }} />

              <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                <Typography variant="body2" color="text.secondary">
                  Store usage
                </Typography>
                <Typography variant="body2" fontWeight={700}>
                  {meta.used} / {meta.storeLimit}
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={usagePct}
                sx={{ height: 8, borderRadius: 4, mb: 2 }}
              />

              <Button
                variant="contained"
                fullWidth
                disabled={hasPending}
                onClick={() => {
                  setRequestedLimit(String(meta.storeLimit + 1));
                  setOpen(true);
                }}
              >
                {hasPending ? "Upgrade Requested" : "Request More Stores"}
              </Button>
              {hasPending && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 1, display: "block", textAlign: "center" }}
                >
                  An upgrade request is pending admin approval.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={7}>
          <Card sx={{ height: "100%" }}>
            <CardHeader title="Upgrade Requests" titleTypographyProps={{ variant: "h6" }} />
            <Divider />
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell align="center">From</TableCell>
                    <TableCell align="center">To</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {requests.map((r) => (
                    <TableRow key={r._id}>
                      <TableCell>{formatDate(r.createdAt)}</TableCell>
                      <TableCell align="center">{r.currentLimit}</TableCell>
                      <TableCell align="center">
                        <Chip size="small" label={r.requestedLimit} color="primary" variant="outlined" />
                      </TableCell>
                      <TableCell>
                        <Chip size="small" label={r.status} color={STATUS_COLOR[r.status]} variant="outlined" />
                      </TableCell>
                    </TableRow>
                  ))}
                  {!loading && requests.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} sx={{ textAlign: "center", py: 5, color: "text.secondary" }}>
                        No upgrade requests yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Grid>
      </Grid>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Request Plan Upgrade</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2, mt: 1 }}>
              {error}
            </Alert>
          )}
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, mt: 1 }}>
            Tell the platform admin how many stores you need. They&apos;ll review and
            upgrade your plan.
          </Typography>
          <Stack spacing={2}>
            <TextField
              label="Total stores needed"
              type="number"
              value={requestedLimit}
              onChange={(e) => setRequestedLimit(e.target.value)}
              fullWidth
              helperText={`Current limit: ${meta.storeLimit}`}
            />
            <TextField
              label="Reason (optional)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              fullWidth
              multiline
              rows={3}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button color="inherit" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant="contained" onClick={submit}>
            Send Request
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
