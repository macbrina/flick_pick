"use client";

import { useEffect } from "react";
import { useSnackbar } from "notistack";
import IconButton from "@mui/material/IconButton";
import Close from "@mui/icons-material/Close";

const SnackbarNotification = ({ message, variant = "info" }) => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  useEffect(() => {
    enqueueSnackbar(message, {
      variant,
      action: (key) => (
        <IconButton
          aria-label="close"
          color="inherit"
          onClick={() => closeSnackbar(key)}
        >
          <Close />
        </IconButton>
      ),
    });
  }, [enqueueSnackbar, closeSnackbar, message, variant]);

  return null;
};

export default SnackbarNotification;
