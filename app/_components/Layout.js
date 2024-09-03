"use client";

import Header from "@/app/_components/Header";
import Sidebar from "@/app/_components/Sidebar";
import BottomBar from "@/app/_components/BottomBar";
import { Box, CssBaseline, Grid, useMediaQuery } from "@mui/material";
import { useMovies } from "@/app/_context/MoviesContext";
import { SnackbarProvider } from "notistack";
import { NotificationProvider } from "../_context/NotificationContext";

export default function Layout({ children }) {
  const { state } = useMovies();
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("md"));

  return (
    <SnackbarProvider maxSnack={3}>
      <NotificationProvider>
        <Box
          sx={{
            display: state.drawerOpen ? "flex" : "block",
            transition: "width 0.3s ease",
          }}
        >
          <CssBaseline />
          <Header />

          <Grid
            container
            sx={{ height: !isMobile ? "100%" : "calc(100vh - 64px - 8px)" }}
          >
            {isMobile ? (
              <Sidebar />
            ) : (
              <Grid item xs={2} md={2}>
                <Sidebar />
              </Grid>
            )}

            {children}
          </Grid>
          <BottomBar />
        </Box>
      </NotificationProvider>
    </SnackbarProvider>
  );
}
