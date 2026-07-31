"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Card,
  Stack,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Chip,
  IconButton,
  MenuItem,
  Tooltip,
  Snackbar,
  Alert,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import AddBoxRoundedIcon from "@mui/icons-material/AddBoxRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import ProductDialog from "@/components/ProductDialog";
import ReceiptImportDialog from "@/components/ReceiptImportDialog";
import { formatCurrency } from "@/lib/format";
import { useBusiness } from "@/components/BusinessContext";

export default function ProductsPage() {
  const { labels } = useBusiness();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [importOpen, setImportOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [toast, setToast] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [pRes, cRes] = await Promise.all([
        fetch("/api/products").then((r) => r.json()),
        fetch("/api/categories").then((r) => r.json()),
      ]);
      setProducts(pRes.data || []);
      setCategories(cRes.data || []);
    } catch (e) {
      setToast({ severity: "error", msg: e.message });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.sku || "").toLowerCase().includes(search.toLowerCase()) ||
        (p.barcode || "").toLowerCase().includes(search.toLowerCase());
      const matchesCat =
        categoryFilter === "all" || p.category === categoryFilter;
      return matchesSearch && matchesCat;
    });
  }, [products, search, categoryFilter]);

  const handleDelete = async (id) => {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    if (res.ok) {
      setProducts((prev) => prev.filter((p) => p._id !== id));
      setToast({ severity: "success", msg: "Product deleted" });
    } else {
      setToast({ severity: "error", msg: "Failed to delete" });
    }
  };

  const handleRestock = async (id) => {
    const amount = prompt("Add stock quantity:");
    if (amount == null) return;
    const res = await fetch(`/api/products/${id}/stock`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "add", amount: Number(amount) }),
    });
    const json = await res.json();
    if (res.ok) {
      setProducts((prev) => prev.map((p) => (p._id === id ? json.data : p)));
      setToast({ severity: "success", msg: "Stock updated" });
    } else {
      setToast({ severity: "error", msg: json.error });
    }
  };

  const columns = [
    {
      field: "name",
      headerName: labels.Item,
      flex: 1.4,
      minWidth: 180,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight={600} noWrap>
            {params.row.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {params.row.sku || "—"}
          </Typography>
        </Box>
      ),
    },
    { field: "category", headerName: "Category", flex: 1, minWidth: 120 },
    {
      field: "sellingPrice",
      headerName: "Price",
      flex: 0.8,
      minWidth: 100,
      valueFormatter: (value) => formatCurrency(value),
    },
    {
      field: "stock",
      headerName: "Stock",
      flex: 0.9,
      minWidth: 130,
      renderCell: (params) => {
        const low = params.row.stock <= params.row.lowStockThreshold;
        const out = params.row.stock <= 0;
        return (
          <Chip
            size="small"
            label={`${params.row.stock} ${params.row.unit}`}
            color={out ? "error" : low ? "warning" : "success"}
            variant={low || out ? "filled" : "outlined"}
          />
        );
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      minWidth: 150,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Add stock">
            <IconButton size="small" onClick={() => handleRestock(params.row._id)}>
              <AddBoxRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton
              size="small"
              onClick={() => {
                setEditing(params.row);
                setDialogOpen(true);
              }}
            >
              <EditRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              size="small"
              color="error"
              onClick={() => handleDelete(params.row._id)}
            >
              <DeleteOutlineRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

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
          <Typography variant="h4">{labels.inventory}</Typography>
          <Typography variant="body2" color="text.secondary">
            {products.length} {labels.items} · manage stock and pricing
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5}>
          <Button
            variant="outlined"
            startIcon={<ReceiptLongRoundedIcon />}
            onClick={() => setImportOpen(true)}
          >
            Import Receipt
          </Button>
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={() => {
              setEditing(null);
              setDialogOpen(true);
            }}
          >
            {labels.addItem}
          </Button>
        </Stack>
      </Stack>

      <Card sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
          <TextField
            placeholder="Search by name, SKU or barcode…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            select
            label="Category"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="all">All categories</MenuItem>
            {categories.map((c) => (
              <MenuItem key={c._id} value={c.name}>
                {c.name}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </Card>

      <Card>
        <DataGrid
          rows={filtered}
          columns={columns}
          getRowId={(row) => row._id}
          loading={loading}
          disableRowSelectionOnClick
          autoHeight
          rowHeight={62}
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
          sx={{
            border: "none",
            "& .MuiDataGrid-columnHeaders": {
              bgcolor: "background.default",
            },
            "& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within": {
              outline: "none",
            },
          }}
        />
      </Card>

      <ReceiptImportDialog
        open={importOpen}
        onClose={() => setImportOpen(false)}
        categories={categories}
        onImported={(count) => {
          setToast({ severity: "success", msg: `${count} items added to inventory` });
          load();
        }}
      />

      <ProductDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        product={editing}
        categories={categories}
        onSaved={(saved) => {
          setProducts((prev) => {
            const exists = prev.find((p) => p._id === saved._id);
            if (exists) return prev.map((p) => (p._id === saved._id ? saved : p));
            return [saved, ...prev];
          });
          setToast({ severity: "success", msg: "Product saved" });
        }}
      />

      <Snackbar
        open={!!toast}
        autoHideDuration={3000}
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
