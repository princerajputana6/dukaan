"use client";

import Link from "next/link";
import { Box, Card, CardContent, Typography, Button, Stack, Avatar } from "@mui/material";
import StoreMallDirectoryRoundedIcon from "@mui/icons-material/StoreMallDirectoryRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import HourglassEmptyRoundedIcon from "@mui/icons-material/HourglassEmptyRounded";

export default function NoStoreState({ role, ownerName }) {
  const isAdmin = role === "admin";

  return (
    <Box sx={{ display: "flex", justifyContent: "center", pt: { xs: 4, md: 8 } }}>
      <Card sx={{ maxWidth: 520, width: "100%" }}>
        <CardContent sx={{ p: { xs: 4, md: 5 }, textAlign: "center" }}>
          <Avatar
            variant="rounded"
            sx={{
              bgcolor: isAdmin ? "rgba(47,126,218,0.10)" : "background.default",
              color: isAdmin ? "primary.main" : "text.secondary",
              width: 64,
              height: 64,
              mx: "auto",
              mb: 2.5,
            }}
          >
            {isAdmin ? (
              <StoreMallDirectoryRoundedIcon fontSize="large" />
            ) : (
              <HourglassEmptyRoundedIcon fontSize="large" />
            )}
          </Avatar>

          {isAdmin ? (
            <>
              <Typography variant="h5" sx={{ mb: 1 }}>
                Let&apos;s set up your first store
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 3.5 }}>
                Welcome{ownerName ? `, ${ownerName.split(" ")[0]}` : ""}! Create a store to
                start adding products, billing customers and tracking your inventory.
              </Typography>
              <Stack direction="row" spacing={1.5} justifyContent="center">
                <Button
                  component={Link}
                  href="/stores"
                  variant="contained"
                  size="large"
                  startIcon={<AddRoundedIcon />}
                >
                  Create Your First Store
                </Button>
              </Stack>
            </>
          ) : (
            <>
              <Typography variant="h5" sx={{ mb: 1 }}>
                No store assigned yet
              </Typography>
              <Typography color="text.secondary">
                You haven&apos;t been assigned to a store. Please ask your shop owner to
                assign you to a store, then refresh this page.
              </Typography>
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
