"use client";

import { Box, Typography, Button } from "@mui/material";
import Link from "next/link";
import ClientOnly from "@/app/_components/ClientOnly";

function NotFound() {
  return (
    <ClientOnly>
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        height="100vh"
        textAlign="center"
        sx={(theme) => ({
          backgroundColor:
            theme.palette.mode === "light"
              ? "rgba(249,250,251, 0.4)"
              : "rgba(25, 32, 48, 1)",
          spaceY: 6,
        })}
      >
        <Typography variant="h4" component="h1" fontWeight="bold">
          This page could not be found :(
        </Typography>
        <Button
          component={Link}
          href="/"
          variant="contained"
          color="primary"
          sx={{ mt: 2, px: 6, py: 3 }}
        >
          Go back home
        </Button>
      </Box>
    </ClientOnly>
  );
}

export default NotFound;
