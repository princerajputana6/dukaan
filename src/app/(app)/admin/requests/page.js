"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Card,
  Typography,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Stack,
  Snackbar,
  Alert,
  Badge,
} from "@mui/material";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import PersonAddRoundedIcon from "@mui/icons-material/PersonAddRounded";
import { formatDate } from "@/lib/format";

const STATUS_COLOR = {
  new: "info",
  pending: "warning",
  contacted: "info",
  approved: "success",
  rejected: "default",
};

export default function RequestsPage() {
  const router = useRouter();
  const [tab, setTab] = useState(0);
  const [accountReqs, setAccountReqs] = useState([]);
  const [upgradeReqs, setUpgradeReqs] = useState([]);
  const [toast, setToast] = useState(null);

  const load = useCallback(async () => {
    const [a, u] = await Promise.all([
      fetch("/api/account-requests").then((r) => r.json()),
      fetch("/api/upgrade-requests").then((r) => r.json()),
    ]);
    setAccountReqs(a.data || []);
    setUpgradeReqs(u.data || []);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const updateAccount = async (id, status) => {
    const res = await fetch(`/api/account-requests/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setToast({ severity: "success", msg: `Marked ${status}` });
      load();
    }
  };

  const handleUpgrade = async (id, action) => {
    const res = await fetch(`/api/upgrade-requests/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    const json = await res.json();
    if (res.ok) {
      setToast({
        severity: "success",
        msg: action === "approve" ? "Upgrade approved — limit raised" : "Request rejected",
      });
      load();
    } else {
      setToast({ severity: "error", msg: json.error });
    }
  };

  const newAccounts = accountReqs.filter((r) => r.status === "new").length;
  const pendingUpgrades = upgradeReqs.filter((r) => r.status === "pending").length;

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 0.5 }}>
        Requests
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Account requests from the website and plan-upgrade requests from owners
      </Typography>

      <Card>
        <Tabs value={tab} onChange={(_e, v) => setTab(v)} sx={{ px: 2, borderBottom: "1px solid", borderColor: "divider" }}>
          <Tab
            label={
              <Badge badgeContent={newAccounts} color="error" sx={{ pr: newAccounts ? 1.5 : 0 }}>
                Account Requests
              </Badge>
            }
          />
          <Tab
            label={
              <Badge badgeContent={pendingUpgrades} color="error" sx={{ pr: pendingUpgrades ? 1.5 : 0 }}>
                Upgrade Requests
              </Badge>
            }
          />
        </Tabs>

        {tab === 0 && (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Business</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell align="center">Stores</TableCell>
                  <TableCell>Received</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {accountReqs.map((r) => (
                  <TableRow key={r._id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {r.businessName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {r.ownerName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{r.email}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {r.phone || "—"}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">{r.storeCount}</TableCell>
                    <TableCell>{formatDate(r.createdAt)}</TableCell>
                    <TableCell>
                      <Chip size="small" label={r.status} color={STATUS_COLOR[r.status]} variant="outlined" />
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        {r.status !== "approved" && (
                          <Button size="small" onClick={() => updateAccount(r._id, "contacted")}>
                            Contacted
                          </Button>
                        )}
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<PersonAddRoundedIcon />}
                          onClick={() => router.push(`/admin/businesses?onboard=${r._id}`)}
                        >
                          Onboard
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
                {accountReqs.length === 0 && <Empty colSpan={6} text="No account requests yet." />}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {tab === 1 && (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Business</TableCell>
                  <TableCell align="center">Current Limit</TableCell>
                  <TableCell align="center">Requested</TableCell>
                  <TableCell>Reason</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {upgradeReqs.map((r) => (
                  <TableRow key={r._id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {r.businessName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(r.createdAt)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">{r.currentLimit}</TableCell>
                    <TableCell align="center">
                      <Chip size="small" label={r.requestedLimit} color="primary" />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {r.reason || "—"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip size="small" label={r.status} color={STATUS_COLOR[r.status]} variant="outlined" />
                    </TableCell>
                    <TableCell align="right">
                      {r.status === "pending" ? (
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Button
                            size="small"
                            color="error"
                            startIcon={<CloseRoundedIcon />}
                            onClick={() => handleUpgrade(r._id, "reject")}
                          >
                            Reject
                          </Button>
                          <Button
                            size="small"
                            variant="contained"
                            startIcon={<CheckRoundedIcon />}
                            onClick={() => handleUpgrade(r._id, "approve")}
                          >
                            Approve
                          </Button>
                        </Stack>
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          Handled
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {upgradeReqs.length === 0 && <Empty colSpan={6} text="No upgrade requests yet." />}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

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

function Empty({ colSpan, text }) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} sx={{ textAlign: "center", py: 5, color: "text.secondary" }}>
        {text}
      </TableCell>
    </TableRow>
  );
}
