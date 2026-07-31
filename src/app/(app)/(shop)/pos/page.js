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
  const [toast, setToast] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const load = () =>
    fetch("/api/products")
      .then((r) => r.json())
      .then((res) => setProducts(res.data || []));

  useEffect(() => {
    load();
    fetch("/api/categories")
      .then((r) => r.json())
      .then((res) => setCategories(res.data || []));
    fetch("/api/me")
      .then((r) => r.json())
      .then((res) => setMeInfo(res.data || null));
  }, []);

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
    if (!search) return list;
    const s = search.toLowerCase();
    return list.filter(
      (p) =>
        p.name.toLowerCase().includes(s) ||
        (p.sku || "").toLowerCase().includes(s) ||
        (p.barcode || "").toLowerCase().includes(s)
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
          customerName: customerName || "Walk-in",
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Checkout failed");
      setReceipt(json.data);
      setCart([]);
      setDiscount(0);
      setTax(0);
      setCustomerName("");
      load();
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
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Tap {isFood ? "an item" : "a product"} to add it to the bill
      </Typography>

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
              return (
                <Grid item xs={6} sm={4} lg={3} key={p._id}>
                  <Card
                    onClick={() => addToCart(p)}
                    sx={{
                      cursor: out ? "not-allowed" : "pointer",
                      opacity: out ? 0.55 : 1,
                      transition: "all .15s",
                      "&:hover": {
                        borderColor: out ? "divider" : "primary.main",
                        boxShadow: out ? "none" : "0 4px 16px rgba(47,126,218,.14)",
                      },
                    }}
                  >
                    <CardContent sx={{ p: 1.75, "&:last-child": { pb: 1.75 } }}>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        sx={{
                          minHeight: 40,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
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
                        <Typography fontWeight={700} color="primary.main">
                          {formatCurrency(p.sellingPrice)}
                        </Typography>
                        <Chip
                          size="small"
                          label={out ? "Out" : `${p.stock}`}
                          color={out ? "error" : "default"}
                          variant="outlined"
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
              </Stack>

              <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
                <TextField
                  label="Customer"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  fullWidth
                  placeholder="Walk-in"
                />
                <TextField
                  select
                  label="Payment"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  sx={{ minWidth: 120 }}
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
      <Dialog open={!!receipt} onClose={() => setReceipt(null)} maxWidth="xs" fullWidth>
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
