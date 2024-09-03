"use client";

import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";

function DeleteDialog({ onOpen, onClose, title, onDelete, isDeleting }) {
  return (
    <Dialog open={onOpen} onClose={onClose} fullWidth>
      <DialogTitle>Confirm Deletion</DialogTitle>
      <DialogContent>
        <Typography>Are you sure you want to delete {title}?</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button
          onClick={onDelete}
          color="error"
          variant="contained"
          sx={{
            backgroundColor: "#D32F2F !important",
            "&:hover": { backgroundColor: "#D32F2F !important" },
          }}
          disabled={isDeleting}
        >
          {isDeleting ? <CircularProgress size={20} /> : "Delete"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default DeleteDialog;
