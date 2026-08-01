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
  LinearProgress,
  Snackbar,
  Alert,
  Avatar,
} from "@mui/material";
import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import LockOpenRoundedIcon from "@mui/icons-material/LockOpenRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import { formatCurrency, formatDate } from "@/lib/format";

export default function RegisterPage() {
  const [current, setCurrent] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [closeDialog, setCloseDialog] = useState(false);
  const [openingCash, setOpeningCash] = useState("");
  const [closingCash, setClosingCash] = useState("");
  const [note, setNote] = useState("");
  const [toast, setToast] = useState(null);
  const [summary, setSummary] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [c, h] = await Promise.all([
      fetch("/api/register").then((r) => r.json()),
      fetch("/api/register/history").then((r) => r.json()),
    ]);
    setCurrent(c.data || null);
    setHistory(h.data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const doOpen = async () => {
    const res = await fetch("/api/register/open", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ openingCash: Number(openingCash) || 0 }),
    });
    const json = await res.json();
    if (res.ok) {
      setOpenDialog(false);
      setOpeningCash("");
      setToast({ severity: "success", msg: "Register opened" });
      load();
    } else {
      setToast({ severity: "error", msg: json.error });
    }
  };

  const doClose = async () => {
    const res = await fetch("/api/register/close", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ closingCash: Number(closingCash) || 0, note }),
    });
    const json = await res.json();
    if (res.ok) {
      setCloseDialog(false);
      setClosingCash("");
      setNote("");
      setSummary(json.data);
      load();
    } else {
      setToast({ severity: "error", msg: json.error });
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 0.5 }}>
        Register
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Open and close your cash drawer, and reconcile at the end of the day
      </Typography>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {current ? (
        <Card sx={{ mb: 3, overflow: "hidden" }}>
          <Box sx={{ background: "linear-gradient(135deg,#12A366,#2FB98A)", px: 3, py: 2, display: "flex", alignItems: "center", gap: 1.5 }}>
            <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)" }}>
              <LockOpenRoundedIcon />
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ color: "#fff" }}>
                Register is open
              </Typography>
              <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.85)" }}>
                Opened by {current.cashierName} · {formatDate(current.openedAt)}
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<LockRoundedIcon />}
              onClick={() => {
                setClosingCash("");
                setCloseDialog(true);
              }}
              sx={{ bgcolor: "#fff", color: "success.main", "&:hover": { bgcolor: "#EDEFF3" } }}
            >
              Close Register
            </Button>
          </Box>
          <CardContent>
            <Grid container spacing={2}>
              {[
                { label: "Opening cash", value: formatCurrency(current.openingCash) },
                { label: "Cash sales", value: formatCurrency(current.cashSales) },
                { label: "Card / UPI sales", value: formatCurrency(current.otherSales) },
                { label: "Orders", value: current.ordersCount },
                { label: "Expected in drawer", value: formatCurrency(current.expectedCash), highlight: true },
              ].map((s) => (
                <Grid item xs={6} md key={s.label}>
                  <Typography variant="body2" color="text.secondary">
                    {s.label}
                  </Typography>
                  <Typography variant="h6" fontWeight={800} color={s.highlight ? "success.main" : "text.primary"}>
                    {s.value}
                  </Typography>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      ) : (
        !loading && (
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ textAlign: "center", py: 5 }}>
              <Avatar sx={{ bgcolor: "rgba(47,126,218,0.10)", color: "primary.main", width: 60, height: 60, mx: "auto", mb: 2 }}>
                <AccountBalanceWalletRoundedIcon fontSize="large" />
              </Avatar>
              <Typography variant="h6" gutterBottom>
                No register open
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Open the register with your starting cash to begin the day.
              </Typography>
              <Button variant="contained" startIcon={<LockOpenRoundedIcon />} onClick={() => setOpenDialog(true)}>
                Open Register
              </Button>
            </CardContent>
          </Card>
        )
      )}

      <Card>
        <CardHeader title="Past Sessions" titleTypographyProps={{ variant: "h6" }} />
        <Divider />
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Closed</TableCell>
                <TableCell>Cashier</TableCell>
                <TableCell align="right">Opening</TableCell>
                <TableCell align="right">Cash sales</TableCell>
                <TableCell align="right">Expected</TableCell>
                <TableCell align="right">Counted</TableCell>
                <TableCell align="right">Difference</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {history.map((s) => (
                <TableRow key={s._id} hover>
                  <TableCell>{formatDate(s.closedAt)}</TableCell>
                  <TableCell>{s.cashierName}</TableCell>
                  <TableCell align="right">{formatCurrency(s.openingCash)}</TableCell>
                  <TableCell align="right">{formatCurrency(s.cashSales)}</TableCell>
                  <TableCell align="right">{formatCurrency(s.expectedCash)}</TableCell>
                  <TableCell align="right">{formatCurrency(s.closingCash)}</TableCell>
                  <TableCell align="right">
                    <Chip
                      size="small"
                      label={`${s.difference > 0 ? "+" : ""}${formatCurrency(s.difference)}`}
                      color={s.difference === 0 ? "success" : Math.abs(s.difference) < 10 ? "default" : "error"}
                      variant={s.difference === 0 ? "outlined" : "filled"}
                    />
                  </TableCell>
                </TableRow>
              ))}
              {!loading && history.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} sx={{ textAlign: "center", py: 5, color: "text.secondary" }}>
                    No closed sessions yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Open dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="xs" fullWidth>
        <Box component="form" onSubmit={(e) => { e.preventDefault(); doOpen(); }}>
          <DialogTitle sx={{ fontWeight: 700 }}>Open Register</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              How much cash is in the drawer to start?
            </Typography>
            <TextField
              label="Opening cash"
              type="number"
              value={openingCash}
              onChange={(e) => setOpeningCash(e.target.value)}
              fullWidth
              autoFocus
              InputProps={{ startAdornment: "₹" }}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button color="inherit" onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Open</Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Close dialog */}
      <Dialog open={closeDialog} onClose={() => setCloseDialog(false)} maxWidth="xs" fullWidth>
        <Box component="form" onSubmit={(e) => { e.preventDefault(); doClose(); }}>
          <DialogTitle sx={{ fontWeight: 700 }}>Close Register</DialogTitle>
          <DialogContent>
            {current && (
              <Box sx={{ mb: 2, p: 1.5, bgcolor: "background.default", borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
                <Row label="Opening cash" value={formatCurrency(current.openingCash)} />
                <Row label="Cash sales" value={formatCurrency(current.cashSales)} />
                <Row label="Expected in drawer" value={formatCurrency(current.expectedCash)} bold />
              </Box>
            )}
            <TextField
              label="Counted cash"
              type="number"
              value={closingCash}
              onChange={(e) => setClosingCash(e.target.value)}
              fullWidth
              autoFocus
              InputProps={{ startAdornment: "₹" }}
              sx={{ mb: 2 }}
            />
            {closingCash !== "" && current && (
              <Alert severity={Number(closingCash) - current.expectedCash === 0 ? "success" : "warning"}>
                {(() => {
                  const diff = Number(closingCash) - current.expectedCash;
                  if (diff === 0) return "Cash matches perfectly. 🎉";
                  return `${diff > 0 ? "Over" : "Short"} by ${formatCurrency(Math.abs(diff))}`;
                })()}
              </Alert>
            )}
            <TextField label="Note (optional)" value={note} onChange={(e) => setNote(e.target.value)} fullWidth multiline rows={2} sx={{ mt: 2 }} />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button color="inherit" onClick={() => setCloseDialog(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Close & Reconcile</Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Day-end summary */}
      <Dialog open={!!summary} onClose={() => setSummary(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Day-end Summary</DialogTitle>
        <DialogContent dividers>
          {summary && (
            <Box>
              <Row label="Opening cash" value={formatCurrency(summary.openingCash)} />
              <Row label="Cash sales" value={formatCurrency(summary.cashSales)} />
              <Row label="Card / UPI sales" value={formatCurrency(summary.otherSales)} />
              <Row label="Orders" value={summary.ordersCount} />
              <Divider sx={{ my: 1 }} />
              <Row label="Expected in drawer" value={formatCurrency(summary.expectedCash)} bold />
              <Row label="Counted" value={formatCurrency(summary.closingCash)} bold />
              <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
                <Typography variant="subtitle1">Difference</Typography>
                <Typography variant="subtitle1" color={summary.difference === 0 ? "success.main" : "error.main"}>
                  {summary.difference > 0 ? "+" : ""}{formatCurrency(summary.difference)}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={() => setSummary(null)}>Done</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!toast} autoHideDuration={2500} onClose={() => setToast(null)} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
        {toast ? <Alert severity={toast.severity} onClose={() => setToast(null)}>{toast.msg}</Alert> : null}
      </Snackbar>
    </Box>
  );
}

function Row({ label, value, bold }) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", py: 0.4 }}>
      <Typography variant="body2" color="text.secondary">{label}</Typography>
      <Typography variant="body2" fontWeight={bold ? 700 : 500}>{value}</Typography>
    </Box>
  );
}
