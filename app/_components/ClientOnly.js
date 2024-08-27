"use client";

import getLPTheme from "@/app/_components/getLPTheme";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useEffect, useState } from "react";

function ClientOnly({ children }) {
  const [mounted, setMounted] = useState(false);
  const LPtheme = createTheme(getLPTheme("dark"));

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return <ThemeProvider theme={LPtheme}>{children}</ThemeProvider>;
}

export default ClientOnly;
