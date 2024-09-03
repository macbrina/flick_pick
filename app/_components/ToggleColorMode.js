"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";

import ModeNightRoundedIcon from "@mui/icons-material/ModeNightRounded";
import WbSunnyRoundedIcon from "@mui/icons-material/WbSunnyRounded";
import { useMovies } from "@/app/_context/MoviesContext";

function ToggleColorMode() {
  const { state, toggleThemeMode } = useMovies();

  return (
    <Box sx={{ maxWidth: "32px", mr: 4 }}>
      <Button
        variant="text"
        onClick={toggleThemeMode}
        size="small"
        aria-label="button to toggle theme"
        sx={(theme) => ({
          minWidth: "32px",
          height: "32px",
          p: "4px",
          bgcolor:
            theme.palette.mode == "dark" ? "rgba(50, 50, 50, 1)" : "#e7e8ff",
        })}
      >
        {state.themeMode === "dark" ? (
          <WbSunnyRoundedIcon fontSize="small" />
        ) : (
          <ModeNightRoundedIcon fontSize="small" />
        )}
      </Button>
    </Box>
  );
}

export default ToggleColorMode;
