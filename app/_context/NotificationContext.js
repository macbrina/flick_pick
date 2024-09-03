import Close from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";
import { useSnackbar } from "notistack";
import { createContext, useContext } from "react";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const notify = (message, variant) => {
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
  };

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
