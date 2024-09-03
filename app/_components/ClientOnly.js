"use client";

import getLPTheme from "@/app/_components/getLPTheme";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useEffect, useState } from "react";
import { useMovies } from "@/app/_context/MoviesContext";

function ClientOnly({ children }) {
  const { state } = useMovies();
  const [mounted, setMounted] = useState(false);
  const LPtheme = createTheme(getLPTheme(state.themeMode));

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return <ThemeProvider theme={LPtheme}>{children}</ThemeProvider>;
}

export default ClientOnly;
