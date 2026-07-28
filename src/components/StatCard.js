"use client";

import { Card, CardContent, Box, Typography, Avatar } from "@mui/material";

export default function StatCard({ title, value, icon, color = "primary", sub }) {
  return (
    <Card sx={{ height: "100%" }}>
      <CardContent sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
        <Avatar
          variant="rounded"
          sx={{
            bgcolor: `${color}.main`,
            width: 48,
            height: 48,
            color: "#fff",
          }}
        >
          {icon}
        </Avatar>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2" color="text.secondary" noWrap>
            {title}
          </Typography>
          <Typography variant="h5" sx={{ mt: 0.5 }} noWrap>
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
