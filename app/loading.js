"use client";

import { Box } from "@mui/system";
import ClientOnly from "@/app/_components/ClientOnly";

function loading() {
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
        <div className="pl">
          <div className="pl__dot"></div>
          <div className="pl__dot"></div>
          <div className="pl__dot"></div>
          <div className="pl__dot"></div>
          <div className="pl__dot"></div>
          <div className="pl__dot"></div>
          <div className="pl__dot"></div>
          <div className="pl__dot"></div>
          <div className="pl__dot"></div>
          <div className="pl__dot"></div>
          <div className="pl__dot"></div>
          <div className="pl__dot"></div>
          <div className="pl__text">Loading…</div>
        </div>
      </Box>
    </ClientOnly>
  );
}

export default loading;
