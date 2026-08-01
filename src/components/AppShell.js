"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Avatar,
  Divider,
  Tooltip,
  Menu,
  MenuItem,
  Select,
  FormControl,
  Chip,
  ListSubheader,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import PointOfSaleRoundedIcon from "@mui/icons-material/PointOfSaleRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import CategoryRoundedIcon from "@mui/icons-material/CategoryRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import StoreMallDirectoryRoundedIcon from "@mui/icons-material/StoreMallDirectoryRounded";
import GroupRoundedIcon from "@mui/icons-material/GroupRounded";
import WorkspacePremiumRoundedIcon from "@mui/icons-material/WorkspacePremiumRounded";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import MarkEmailUnreadRoundedIcon from "@mui/icons-material/MarkEmailUnreadRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import Logo from "@/components/Logo";
import { BusinessProvider } from "@/components/BusinessContext";

const DRAWER_WIDTH = 260;

const NAV_BY_ROLE = {
  superadmin: [
    { section: "Platform" },
    { label: "Businesses", href: "/admin/businesses", icon: <BusinessRoundedIcon /> },
    { label: "Requests", href: "/admin/requests", icon: <MarkEmailUnreadRoundedIcon /> },
  ],
  admin: [
    { section: "Operations" },
    { label: "Dashboard", href: "/dashboard", icon: <DashboardRoundedIcon /> },
    { label: "Point of Sale", href: "/pos", icon: <PointOfSaleRoundedIcon /> },
    { label: "Register", href: "/register", icon: <AccountBalanceWalletRoundedIcon /> },
    { label: "Inventory", href: "/products", icon: <Inventory2RoundedIcon /> },
    { label: "Low Stock", href: "/low-stock", icon: <WarningAmberRoundedIcon /> },
    { label: "Categories", href: "/categories", icon: <CategoryRoundedIcon /> },
    { label: "Customers", href: "/customers", icon: <PeopleAltRoundedIcon /> },
    { label: "Sales", href: "/sales", icon: <ReceiptLongRoundedIcon /> },
    { label: "Reports", href: "/reports", icon: <InsightsRoundedIcon /> },
    { section: "Management" },
    { label: "Stores", href: "/stores", icon: <StoreMallDirectoryRoundedIcon /> },
    { label: "Team", href: "/team", icon: <GroupRoundedIcon /> },
    { label: "Plan & Billing", href: "/plan", icon: <WorkspacePremiumRoundedIcon /> },
  ],
  manager: [
    { section: "Operations" },
    { label: "Dashboard", href: "/dashboard", icon: <DashboardRoundedIcon /> },
    { label: "Point of Sale", href: "/pos", icon: <PointOfSaleRoundedIcon /> },
    { label: "Register", href: "/register", icon: <AccountBalanceWalletRoundedIcon /> },
    { label: "Inventory", href: "/products", icon: <Inventory2RoundedIcon /> },
    { label: "Low Stock", href: "/low-stock", icon: <WarningAmberRoundedIcon /> },
    { label: "Categories", href: "/categories", icon: <CategoryRoundedIcon /> },
    { label: "Customers", href: "/customers", icon: <PeopleAltRoundedIcon /> },
    { label: "Sales", href: "/sales", icon: <ReceiptLongRoundedIcon /> },
  ],
};

const ROLE_LABEL = {
  superadmin: "Super Admin",
  admin: "Owner",
  manager: "Store Manager",
};

export default function AppShell({ user, stores = [], activeStoreId, children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const pathname = usePathname();
  const router = useRouter();

  const isFood = user.business?.type === "food";
  const nav = (NAV_BY_ROLE[user.role] || []).map((n) =>
    n.href === "/products" && isFood ? { ...n, label: "Menu" } : n
  );
  const flat = nav.filter((n) => n.href);

  const go = (href) => {
    router.push(href);
    setMobileOpen(false);
  };

  const isActive = (href) => pathname === href || pathname.startsWith(href + "/");

  const changeStore = async (storeId) => {
    await fetch("/api/auth/set-store", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ storeId }),
    });
    router.refresh();
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const showStoreSwitcher = user.role !== "superadmin" && stores.length > 0;

  const drawer = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Box sx={{ px: 2.5, py: 2.5 }}>
        <Logo height={26} />
        <Box sx={{ mt: 1.75, minWidth: 0 }}>
          {user.business?.name && (
            <Typography variant="subtitle1" sx={{ lineHeight: 1.15 }} noWrap>
              {user.business.name}
            </Typography>
          )}
          <Typography variant="caption" color="text.secondary">
            {ROLE_LABEL[user.role]}
          </Typography>
        </Box>
      </Box>

      {showStoreSwitcher && (
        <Box sx={{ px: 2, pb: 1.5 }}>
          <FormControl fullWidth size="small">
            <Select
              value={activeStoreId || ""}
              onChange={(e) => changeStore(e.target.value)}
              displayEmpty
              sx={{ bgcolor: "background.default" }}
              renderValue={(val) => {
                const s = stores.find((x) => x.id === val);
                return (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <StoreMallDirectoryRoundedIcon
                      fontSize="small"
                      sx={{ color: "primary.main" }}
                    />
                    <Typography variant="body2" noWrap>
                      {s?.name || "Select store"}
                    </Typography>
                  </Box>
                );
              }}
            >
              {stores.map((s) => (
                <MenuItem key={s.id} value={s.id}>
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      {s.name}
                    </Typography>
                    {s.location && (
                      <Typography variant="caption" color="text.secondary">
                        {s.location}
                      </Typography>
                    )}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      )}

      <Divider />
      <List sx={{ px: 1.5, py: 1, flex: 1, overflowY: "auto" }}>
        {nav.map((item, i) => {
          if (item.section) {
            return (
              <ListSubheader
                key={`s-${i}`}
                disableSticky
                sx={{
                  bgcolor: "transparent",
                  color: "text.secondary",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  lineHeight: "32px",
                  mt: i === 0 ? 0 : 1,
                }}
              >
                {item.section}
              </ListSubheader>
            );
          }
          const active = isActive(item.href);
          return (
            <ListItemButton
              key={item.href}
              onClick={() => go(item.href)}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                color: active ? "primary.main" : "text.primary",
                bgcolor: active ? "rgba(47,126,218,0.10)" : "transparent",
                "&:hover": {
                  bgcolor: active ? "rgba(47,126,218,0.16)" : "rgba(85,86,99,0.06)",
                },
              }}
            >
              <ListItemIcon
                sx={{ minWidth: 40, color: active ? "primary.main" : "text.secondary" }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{ fontWeight: active ? 700 : 500, fontSize: 14.5 }}
              />
            </ListItemButton>
          );
        })}
      </List>

      <Box sx={{ p: 2 }}>
        <Box
          sx={{
            borderRadius: 3,
            p: 1.5,
            bgcolor: "background.default",
            border: "1px solid",
            borderColor: "divider",
            display: "flex",
            alignItems: "center",
            gap: 1.25,
          }}
        >
          <Avatar sx={{ bgcolor: "secondary.main", width: 34, height: 34, fontSize: 14 }}>
            {user.name?.[0]?.toUpperCase()}
          </Avatar>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="body2" fontWeight={600} noWrap>
              {user.name}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              @{user.username}
            </Typography>
          </Box>
          <Tooltip title="Sign out">
            <IconButton size="small" onClick={logout}>
              <LogoutRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  );

  const currentLabel =
    flat.find((n) => isActive(n.href))?.label || user.business?.name || "Dukaan";

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
        }}
      >
        <Toolbar>
          <IconButton
            edge="start"
            onClick={() => setMobileOpen(true)}
            sx={{ mr: 1.5, display: { md: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, fontSize: 18 }}>
            {currentLabel}
          </Typography>
          {user.role !== "superadmin" && user.business?.plan && (
            <Chip
              size="small"
              label={user.business.plan.toUpperCase()}
              color="primary"
              variant="outlined"
              sx={{ mr: 1.5, display: { xs: "none", sm: "inline-flex" } }}
            />
          )}
          <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
            <Avatar sx={{ bgcolor: "secondary.main", width: 34, height: 34, fontSize: 15 }}>
              {user.name?.[0]?.toUpperCase()}
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={!!anchorEl}
            onClose={() => setAnchorEl(null)}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
          >
            <MenuItem disabled>
              <Box>
                <Typography variant="body2" fontWeight={600}>
                  {user.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {ROLE_LABEL[user.role]}
                </Typography>
              </Box>
            </MenuItem>
            <Divider />
            <MenuItem onClick={logout}>
              <ListItemIcon>
                <LogoutRoundedIcon fontSize="small" />
              </ListItemIcon>
              Sign out
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: DRAWER_WIDTH,
              borderRight: "1px solid",
              borderColor: "divider",
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          open
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: DRAWER_WIDTH,
              borderRight: "1px solid",
              borderColor: "divider",
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          minHeight: "100vh",
          bgcolor: "background.default",
        }}
      >
        <Toolbar />
        <Box sx={{ p: { xs: 2, md: 3 } }}>
          <BusinessProvider business={user.business}>{children}</BusinessProvider>
        </Box>
      </Box>
    </Box>
  );
}
