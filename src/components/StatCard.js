"use client";

import { Card, CardContent, Box, Typography, Avatar } from "@mui/material";

const TINTS = {
  primary: "linear-gradient(135deg, #2F7EDA 0%, #4C63E6 100%)",
  success: "linear-gradient(135deg, #12A366 0%, #2FB98A 100%)",
  warning: "linear-gradient(135deg, #E0A23B 0%, #F0C05A 100%)",
  secondary: "linear-gradient(135deg, #7C5CFC 0%, #9B7BFF 100%)",
  error: "linear-gradient(135deg, #E5484D 0%, #F16A70 100%)",
};

export default function StatCard({ title, value, icon, color = "primary", sub }) {
  return (
    <Card
      sx={{
        height: "100%",
        position: "relative",
        overflow: "hidden",
        transition: "transform .25s cubic-bezier(.2,.7,.3,1), box-shadow .25s ease",
        "&:hover": { transform: "translateY(-4px)", boxShadow: "0 16px 32px rgba(16,24,40,0.10)" },
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: -30,
          right: -30,
          width: 110,
          height: 110,
          borderRadius: "50%",
          background: TINTS[color] || TINTS.primary,
          opacity: 0.08,
        }}
      />
      <CardContent sx={{ display: "flex", alignItems: "flex-start", gap: 2, position: "relative" }}>
        <Avatar
          variant="rounded"
          sx={{
            width: 50,
            height: 50,
            color: "#fff",
            background: TINTS[color] || TINTS.primary,
            boxShadow: "0 8px 18px rgba(16,24,40,0.14)",
          }}
        >
          {icon}
        </Avatar>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2" color="text.secondary" noWrap>
            {title}
          </Typography>
          <Typography variant="h5" sx={{ mt: 0.5, fontWeight: 800 }} noWrap>
            {value}
          </Typography>
          {sub && (
            <Typography variant="caption" color="text.secondary">
              {sub}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
