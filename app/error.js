"use client";

import { Box, Typography, Button } from "@mui/material";
import ClientOnly from "@/app/_components/ClientOnly";

export default function Error({ error, reset }) {
  return (
    <ClientOnly>
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        flexDirection="column"
        gap={2}
        height="100vh"
        textAlign="center"
        sx={(theme) => ({
          backgroundColor:
            theme.palette.mode === "light"
              ? "rgba(249,250,251, 0.4)"
              : "rgba(25, 32, 48, 1)",
        })}
      >
        <Typography variant="h4" component="h1" fontWeight="bold">
          Something went wrong!
        </Typography>
        <Typography variant="body1">{error.message}</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => window.location.reload()}
          sx={{ mt: 2, px: 4, py: 2 }}
        >
          Try again
        </Button>
      </Box>
    </ClientOnly>
  );
}
