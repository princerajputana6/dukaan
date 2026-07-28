"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AppBar,
  Toolbar,
  Box,
  Button,
  Container,
  IconButton,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Divider,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import Logo from "@/components/Logo";

const LINKS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export default function MarketingHeader() {
  const [open, setOpen] = useState(false);
  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: "rgba(252,253,253,0.85)",
        backdropFilter: "blur(8px)",
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ gap: 1 }}>
          <Box component={Link} href="/" sx={{ display: "flex", alignItems: "center", textDecoration: "none", flexGrow: 1 }}>
            <Logo height={30} />
          </Box>

          <Box sx={{ display: { xs: "none", md: "flex" }, gap: 1, alignItems: "center" }}>
            {LINKS.map((l) => (
              <Button key={l.href} component={Link} href={l.href} color="inherit" sx={{ color: "text.primary" }}>
                {l.label}
              </Button>
            ))}
            <Button component={Link} href="/login" color="inherit" sx={{ color: "text.primary" }}>
              Login
            </Button>
            <Button component={Link} href="/request-account" variant="contained">
              Request Access
            </Button>
          </Box>

          <IconButton sx={{ display: { md: "none" }, color: "text.primary" }} onClick={() => setOpen(true)}>
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </Container>

      <Drawer anchor="right" open={open} onClose={() => setOpen(false)}>
        <Box sx={{ width: 250 }}>
          <List>
            {LINKS.map((l) => (
              <ListItemButton key={l.href} component={Link} href={l.href} onClick={() => setOpen(false)}>
                <ListItemText primary={l.label} />
              </ListItemButton>
            ))}
          </List>
          <Divider />
          <List>
            <ListItemButton component={Link} href="/login" onClick={() => setOpen(false)}>
              <ListItemText primary="Login" />
            </ListItemButton>
            <ListItemButton component={Link} href="/request-account" onClick={() => setOpen(false)}>
              <ListItemText primary="Request Access" primaryTypographyProps={{ color: "primary", fontWeight: 700 }} />
            </ListItemButton>
          </List>
        </Box>
      </Drawer>
    </AppBar>
  );
}
