"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  Stack,
  Divider,
  MenuItem,
  Chip,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import RemoveRoundedIcon from "@mui/icons-material/RemoveRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import ShoppingCartRoundedIcon from "@mui/icons-material/ShoppingCartRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import QrCodeScannerRoundedIcon from "@mui/icons-material/QrCodeScannerRounded";
import PrintRoundedIcon from "@mui/icons-material/PrintRounded";
import IosShareRoundedIcon from "@mui/icons-material/IosShareRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import Link from "next/link";
import { formatCurrency } from "@/lib/format";
import { computeGst, printReceipt, shareReceiptPdf } from "@/lib/receipt";
import { useBusiness } from "@/components/BusinessContext";

export default function PosPage() {
  const { isFood } = useBusiness();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [meInfo, setMeInfo] = useState(null);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [customerName, setCustomerName] = useState("");
  const [customer, setCustomer] = useState(null);
  const [custSearch, setCustSearch] = useState("");
  const [custResults, setCustResults] = useState([]);
  const [registerOpen, setRegisterOpen] = useState(null);
  const [toast, setToast] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const load = () =>
    fetch("/api/products")
      .then((r) => r.json())
      .then((res) => setProducts(res.data || []));

  const loadRegister = () =>
    fetch("/api/register")
      .then((r) => r.json())
      .then((res) => setRegisterOpen(!!res.data));

  useEffect(() => {
    load();
    loadRegister();
    fetch("/api/categories")
      .then((r) => r.json())
      .then((res) => setCategories(res.data || []));
    fetch("/api/me")
      .then((r) => r.json())
      .then((res) => setMeInfo(res.data || null));
  }, []);

  // Live customer search
  useEffect(() => {
    if (!custSearch.trim()) {
      setCustResults([]);
      return;
    }
    const t = setTimeout(() => {
      fetch(`/api/customers?q=${encodeURIComponent(custSearch)}`)
        .then((r) => r.json())
        .then((res) => setCustResults(res.data || []));
    }, 250);
    return () => clearTimeout(t);
  }, [custSearch]);

  const addNewCustomer = async () => {
    const name = custSearch.trim();
    if (!name) return;
    const isPhone = /^\d{6,}$/.test(name);
    const res = await fetch("/api/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(isPhone ? { name: "Customer", phone: name } : { name }),
    });
    const json = await res.json();
    if (res.ok) {
      setCustomer(json.data);
      setCustSearch("");
      setCustResults([]);
    } else {
      setToast({ severity: "error", msg: json.error });
    }
  };

  // Categories that actually have products, for the top filter bar.
  const categoryNames = useMemo(() => {
    const used = new Set(products.map((p) => p.category).filter(Boolean));
    const ordered = categories.map((c) => c.name).filter((n) => used.has(n));
    // include any product categories not in the category list
    for (const n of used) if (!ordered.includes(n)) ordered.push(n);
    return ordered;
  }, [products, categories]);

  const filtered = useMemo(() => {
    let list = products.filter((p) => p.active !== false);
    if (categoryFilter !== "all") {
      list = list.filter((p) => p.category === categoryFilter);
    }
    if (search) {
      const s = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(s) ||
          (p.sku || "").toLowerCase().includes(s) ||
          (p.barcode || "").toLowerCase().includes(s)
      );
    }
    // Push out-of-stock items to the bottom. Array.sort is stable, so items
    // otherwise keep their original (recently-added-first) order.
    return [...list].sort(
      (a, b) => (a.stock <= 0 ? 1 : 0) - (b.stock <= 0 ? 1 : 0)
    );
  }, [products, search, categoryFilter]);

  const addToCart = (product) => {
    if (product.stock <= 0) {
      setToast({ severity: "warning", msg: `${product.name} is out of stock` });
      return;
    }
    setCart((prev) => {
      const existing = prev.find((i) => i.product === product._id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          setToast({ severity: "warning", msg: "Reached available stock" });
          return prev;
        }
        return prev.map((i) =>
          i.product === product._id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [
        ...prev,
        {
          product: product._id,
          name: product.name,
          sku: product.sku,
          price: product.sellingPrice,
          stock: product.stock,
          unit: product.unit,
          quantity: 1,
        },
      ];
    });
  };

  // Barcode scanners type the code then send Enter. On Enter, add an exact
  // barcode/SKU match (or the only visible result) and clear the field.
  const handleScan = (e) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    const term = search.trim();
    if (!term) return;
    const lower = term.toLowerCase();
    const match =
      products.find((p) => (p.barcode || "").toLowerCase() === lower) ||
      products.find((p) => (p.sku || "").toLowerCase() === lower) ||
      (filtered.length === 1 ? filtered[0] : null);
    if (match) {
      addToCart(match);
      setSearch("");
    } else {
      setToast({ severity: "warning", msg: `No product matches "${term}"` });
    }
  };

  const changeQty = (id, delta) => {
    setCart((prev) =>
      prev
        .map((i) => {
          if (i.product !== id) return i;
          const q = i.quantity + delta;
          if (q > i.stock) {
            setToast({ severity: "warning", msg: "Reached available stock" });
            return i;
          }
          return { ...i, quantity: q };
        })
        .filter((i) => i.quantity > 0)
    );
  };

  const removeItem = (id) =>
    setCart((prev) => prev.filter((i) => i.product !== id));

  const subTotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const total = Math.max(0, subTotal - Number(discount || 0) + Number(tax || 0));

  const checkout = async () => {
    if (!cart.length) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map((i) => ({
            product: i.product,
            name: i.name,
            quantity: i.quantity,
            price: i.price,
          })),
          discount: Number(discount || 0),
          tax: Number(tax || 0),
          paymentMethod,
          customerId: customer?._id || null,
          customerName: customer?.name || customerName || "Walk-in",
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Checkout failed");
      setReceipt(json.data);
      setCart([]);
      setDiscount(0);
      setTax(0);
      setCustomerName("");
      setCustomer(null);
      setCustSearch("");
      load();
      loadRegister();
    } catch (e) {
      setToast({ severity: "error", msg: e.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 0.5 }}>
        Point of Sale
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Tap {isFood ? "an item" : "a product"} to add it to the bill
      </Typography>

      {registerOpen === false && (
        <Alert
          severity="info"
          icon={false}
          sx={{ mb: 2, borderRadius: 3 }}
          action={
            <Button color="inherit" size="small" component={Link} href="/register">
              Open Register
            </Button>
          }
        >
          The cash register is closed. Open it to track cash for the day.
        </Alert>
      )}

      <Grid container spacing={2.5}>
        {/* Product picker */}
        <Grid item xs={12} md={7} lg={8}>
          <Card sx={{ p: 2, mb: 2 }}>
            <TextField
              placeholder="Search or scan barcode… (press Enter to add)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleScan}
              fullWidth
              autoFocus
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon fontSize="small" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <QrCodeScannerRoundedIcon fontSize="small" sx={{ color: "text.secondary" }} />
                  </InputAdornment>
                ),
              }}
            />
          </Card>

          {categoryNames.length > 0 && (
            <Box
              sx={{
                display: "flex",
                gap: 1,
                mb: 2,
                overflowX: "auto",
                pb: 1,
                "&::-webkit-scrollbar": { height: 6 },
                "&::-webkit-scrollbar-thumb": { bgcolor: "divider", borderRadius: 3 },
              }}
            >
              <Chip
                label="All"
                color={categoryFilter === "all" ? "primary" : "default"}
                variant={categoryFilter === "all" ? "filled" : "outlined"}
                onClick={() => setCategoryFilter("all")}
                sx={{ flexShrink: 0 }}
              />
              {categoryNames.map((name) => (
                <Chip
                  key={name}
                  label={name}
                  color={categoryFilter === name ? "primary" : "default"}
                  variant={categoryFilter === name ? "filled" : "outlined"}
                  onClick={() => setCategoryFilter(name)}
                  sx={{ flexShrink: 0 }}
                />
              ))}
            </Box>
          )}

          <Grid container spacing={1.5}>
            {filtered.map((p) => {
              const out = p.stock <= 0;
              const hasImg = !!p.image;
              return (
                <Grid item xs={6} sm={4} lg={3} key={p._id}>
                  <Card
                    onClick={() => addToCart(p)}
                    sx={{
                      position: "relative",
                      overflow: "hidden",
                      cursor: out ? "not-allowed" : "pointer",
                      opacity: out ? 0.55 : 1,
                      transition: "all .15s",
                      ...(hasImg && {
                        backgroundImage: `url(${p.image})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }),
                      "&:hover": {
                        borderColor: out ? "divider" : "primary.main",
                        boxShadow: out ? "none" : "0 4px 16px rgba(47,126,218,.14)",
                      },
                    }}
                  >
                    {hasImg && (
                      <Box
                        sx={{
                          position: "absolute",
                          inset: 0,
                          background:
                            "linear-gradient(to top, rgba(0,0,0,.74) 0%, rgba(0,0,0,.4) 55%, rgba(0,0,0,.18) 100%)",
                          backdropFilter: "blur(1px)",
                        }}
                      />
                    )}
                    <CardContent
                      sx={{
                        position: "relative",
                        p: 1.75,
                        "&:last-child": { pb: 1.75 },
                        ...(hasImg && {
                          minHeight: 104,
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "flex-end",
                        }),
                      }}
                    >
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        sx={{
                          minHeight: 40,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          ...(hasImg && {
                            color: "#fff",
                            textShadow: "0 1px 3px rgba(0,0,0,.85)",
                          }),
                        }}
                      >
                        {p.name}
                      </Typography>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        sx={{ mt: 1 }}
                      >
                        <Typography
                          fontWeight={700}
                          sx={
                            hasImg
                              ? { color: "#fff", textShadow: "0 1px 3px rgba(0,0,0,.85)" }
                              : { color: "primary.main" }
                          }
                        >
                          {formatCurrency(p.sellingPrice)}
                        </Typography>
                        <Chip
                          size="small"
                          label={out ? "Out" : `${p.stock}`}
                          color={out ? "error" : "default"}
                          variant="outlined"
                          sx={
                            hasImg && !out
                              ? {
                                  color: "#fff",
                                  borderColor: "rgba(255,255,255,.7)",
                                  bgcolor: "rgba(0,0,0,.25)",
                                }
                              : undefined
                          }
                        />
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
            {filtered.length === 0 && (
              <Grid item xs={12}>
                <Box sx={{ p: 5, textAlign: "center" }}>
                  <Typography color="text.secondary">
                    No products found. Add products in Inventory first.
                  </Typography>
                </Box>
              </Grid>
            )}
          </Grid>
        </Grid>

        {/* Cart */}
        <Grid item xs={12} md={5} lg={4}>
          <Card sx={{ position: { md: "sticky" }, top: 88 }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                <ShoppingCartRoundedIcon color="primary" />
                <Typography variant="h6">Current Bill</Typography>
                <Chip size="small" label={cart.length} sx={{ ml: "auto" }} />
              </Stack>
              <Divider sx={{ mb: 1 }} />

              <Box sx={{ maxHeight: 320, overflowY: "auto", mb: 1 }}>
                {cart.length === 0 ? (
                  <Box sx={{ py: 5, textAlign: "center" }}>
                    <Typography color="text.secondary">
                      Cart is empty
                    </Typography>
                  </Box>
                ) : (
                  cart.map((i) => (
                    <Box
                      key={i.product}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        py: 1,
                        borderBottom: "1px solid",
                        borderColor: "divider",
                      }}
                    >
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" fontWeight={600} noWrap>
                          {i.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatCurrency(i.price)} × {i.quantity}
                        </Typography>
                      </Box>
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <IconButton size="small" onClick={() => changeQty(i.product, -1)}>
                          <RemoveRoundedIcon fontSize="inherit" />
                        </IconButton>
                        <Typography sx={{ minWidth: 20, textAlign: "center" }}>
                          {i.quantity}
                        </Typography>
                        <IconButton size="small" onClick={() => changeQty(i.product, 1)}>
                          <AddRoundedIcon fontSize="inherit" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => removeItem(i.product)}
                        >
                          <DeleteOutlineRoundedIcon fontSize="inherit" />
                        </IconButton>
                      </Stack>
                    </Box>
                  ))
                )}
              </Box>

              {/* Customer picker */}
              {customer ? (
                <Box
                  sx={{
                    mb: 1.5,
                    p: 1.25,
                    borderRadius: 2,
                    bgcolor: "rgba(124,92,252,0.08)",
                    border: "1px solid rgba(124,92,252,0.25)",
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <PersonRoundedIcon sx={{ color: "secondary.main" }} />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" fontWeight={600} noWrap>
                      {customer.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {customer.phone || "no phone"} · {customer.points || 0} pts
                    </Typography>
                  </Box>
                  <IconButton size="small" onClick={() => setCustomer(null)}>
                    <CloseRoundedIcon fontSize="small" />
                  </IconButton>
                </Box>
              ) : (
                <Box sx={{ mb: 1.5, position: "relative" }}>
                  <TextField
                    label="Add customer (name or phone)"
                    value={custSearch}
                    onChange={(e) => setCustSearch(e.target.value)}
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonRoundedIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />
                  {custSearch.trim() && (
                    <Box
                      sx={{
                        position: "absolute",
                        zIndex: 5,
                        left: 0,
                        right: 0,
                        mt: 0.5,
                        bgcolor: "background.paper",
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 2,
                        boxShadow: 3,
                        maxHeight: 200,
                        overflowY: "auto",
                      }}
                    >
                      {custResults.map((c) => (
                        <Box
                          key={c._id}
                          onClick={() => {
                            setCustomer(c);
                            setCustSearch("");
                            setCustResults([]);
                          }}
                          sx={{ px: 1.5, py: 1, cursor: "pointer", "&:hover": { bgcolor: "background.default" } }}
                        >
                          <Typography variant="body2" fontWeight={600}>
                            {c.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {c.phone || "no phone"} · {c.points || 0} pts
                          </Typography>
                        </Box>
                      ))}
                      <Box
                        onClick={addNewCustomer}
                        sx={{ px: 1.5, py: 1, cursor: "pointer", borderTop: custResults.length ? "1px solid" : "none", borderColor: "divider", "&:hover": { bgcolor: "background.default" } }}
                      >
                        <Typography variant="body2" color="primary.main" fontWeight={600}>
                          + Add &ldquo;{custSearch}&rdquo; as new customer
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </Box>
              )}

              {/* Discount presets */}
              <Stack direction="row" spacing={0.75} sx={{ mb: 1 }} flexWrap="wrap" useFlexGap>
                {[
                  { label: "5%", fn: () => Math.round(subTotal * 0.05) },
                  { label: "10%", fn: () => Math.round(subTotal * 0.1) },
                  { label: "₹20", fn: () => 20 },
                  { label: "₹50", fn: () => 50 },
                ].map((d) => (
                  <Chip
                    key={d.label}
                    label={d.label}
                    size="small"
                    variant="outlined"
                    onClick={() => setDiscount(d.fn())}
                    disabled={!cart.length}
                  />
                ))}
                {Number(discount) > 0 && (
                  <Chip label="Clear" size="small" color="error" variant="outlined" onClick={() => setDiscount(0)} />
                )}
              </Stack>

              <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
                <TextField
                  label="Discount ₹"
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  fullWidth
                />
                <TextField
                  label="Tax ₹"
                  type="number"
                  value={tax}
                  onChange={(e) => setTax(e.target.value)}
                  fullWidth
                />
                <TextField
                  select
                  label="Payment"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  sx={{ minWidth: 110 }}
                >
                  <MenuItem value="cash">Cash</MenuItem>
                  <MenuItem value="upi">UPI</MenuItem>
                  <MenuItem value="card">Card</MenuItem>
                  <MenuItem value="credit">Credit</MenuItem>
                </TextField>
              </Stack>

              <Divider sx={{ my: 1 }} />
              <Row label="Subtotal" value={formatCurrency(subTotal)} />
              <Row label="Discount" value={`- ${formatCurrency(discount || 0)}`} />
              <Row label="Tax" value={`+ ${formatCurrency(tax || 0)}`} />
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mt: 1,
                  mb: 2,
                }}
              >
                <Typography variant="h6">Total</Typography>
                <Typography variant="h6" color="primary.main">
                  {formatCurrency(total)}
                </Typography>
              </Box>

              <Button
                fullWidth
                variant="contained"
                size="large"
                disabled={!cart.length || submitting}
                onClick={checkout}
              >
                {submitting ? "Processing…" : `Complete Sale · ${formatCurrency(total)}`}
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Receipt dialog */}
      <Dialog
        open={!!receipt}
        onClose={() => setReceipt(null)}
        maxWidth="xs"
        fullWidth
        onKeyDown={(e) => {
          // Enter dismisses the receipt and starts a new sale.
          if (e.key === "Enter") {
            e.preventDefault();
            setReceipt(null);
          }
        }}
      >
        <DialogTitle sx={{ textAlign: "center" }}>
          <CheckCircleRoundedIcon color="success" sx={{ fontSize: 48 }} />
          <Typography variant="h6" component="div" sx={{ mt: 1 }}>
            Sale Completed
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          {receipt && (
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Invoice: {receipt.invoiceNo}
              </Typography>
              {receipt.items.map((it, idx) => (
                <Row
                  key={idx}
                  label={`${it.name} × ${it.quantity}`}
                  value={formatCurrency(it.lineTotal)}
                />
              ))}
              <Divider sx={{ my: 1 }} />
              <Row label="Subtotal" value={formatCurrency(receipt.subTotal)} />
              {receipt.discount > 0 && (
                <Row label="Discount" value={`- ${formatCurrency(receipt.discount)}`} />
              )}
              {receipt.tax > 0 && (
                <Row label="Tax" value={`+ ${formatCurrency(receipt.tax)}`} />
              )}
              <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
                <Typography variant="subtitle1">Total Paid</Typography>
                <Typography variant="subtitle1" color="primary.main">
                  {formatCurrency(receipt.total)}
                </Typography>
              </Box>
              {(() => {
                const gst = computeGst(
                  receipt.total,
                  meInfo?.business?.gstRate,
                  meInfo?.business?.pricesIncludeTax
                );
                if (!gst) return null;
                return (
                  <Box sx={{ mt: 1, pt: 1, borderTop: "1px dashed", borderColor: "divider" }}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Prices include taxes
                    </Typography>
                    <Row label={`CGST @ ${gst.half}%`} value={formatCurrency(gst.cgst)} />
                    <Row label={`SGST @ ${gst.half}%`} value={formatCurrency(gst.sgst)} />
                    <Row label="Total GST" value={formatCurrency(gst.total)} />
                  </Box>
                );
              })()}
              {receipt.customerName && receipt.customerName !== "Walk-in" && (
                <Box
                  sx={{
                    mt: 1.5,
                    p: 1.25,
                    borderRadius: 2,
                    bgcolor: "rgba(224,162,59,0.10)",
                    border: "1px solid rgba(224,162,59,0.3)",
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <PersonRoundedIcon fontSize="small" sx={{ color: "warning.main" }} />
                  <Typography variant="body2" sx={{ flex: 1 }}>
                    {receipt.customerName}
                  </Typography>
                  {receipt.pointsEarned > 0 && (
                    <Chip size="small" color="warning" label={`+${receipt.pointsEarned} pts`} />
                  )}
                </Box>
              )}
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                Paid via {receipt.paymentMethod?.toUpperCase()}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ flexWrap: "wrap", gap: 1 }}>
          <Button
            startIcon={<PrintRoundedIcon />}
            onClick={() => printReceipt(receipt, meInfo?.business, meInfo?.store)}
          >
            Print
          </Button>
          <Button
            startIcon={<IosShareRoundedIcon />}
            onClick={() => shareReceiptPdf(receipt, meInfo?.business, meInfo?.store)}
          >
            Share PDF
          </Button>
          <Button variant="contained" onClick={() => setReceipt(null)}>
            New Sale
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!toast}
        autoHideDuration={2500}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
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

function Row({ label, value }) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", py: 0.4 }}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={600}>
        {value}
      </Typography>
    </Box>
  );
}
