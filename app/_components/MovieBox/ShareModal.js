"use client";

import { useState } from "react";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  CircularProgress,
} from "@mui/material";

function ShareModal({ movie, open, onClose, onShare, isSharing }) {
  const [postContent, setPostContent] = useState("");

  const handleShare = async () => {
    await onShare(postContent);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="share-modal-title"
      aria-describedby="share-modal-description"
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 500,
          bgcolor: "background.paper",
          borderRadius: 2,
          boxShadow: 24,
          p: 4,
        }}
      >
        <Typography id="share-modal-title" variant="h6" component="h2">
          Share {movie.title}
        </Typography>

        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={12}>
            <Box
              sx={{
                position: "relative",
                height: "300px",
                overflow: "hidden",
                borderRadius: "8px",
                objectFit: "contain",
              }}
            >
              <img
                src={
                  !movie.poster_path
                    ? "/images/placeholder.png"
                    : `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                }
                alt={movie.title}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  borderRadius: 8,
                }}
              />
            </Box>
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Your Post"
              fullWidth
              multiline
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              variant="outlined"
            />
          </Grid>
        </Grid>

        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
          <Button
            variant="outlined"
            onClick={onClose}
            sx={{ mr: 2 }}
            disabled={isSharing}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleShare}
            disabled={isSharing || postContent.trim() == ""}
          >
            {isSharing ? (
              <>
                <CircularProgress size={20} color="inherit" /> Posting...
              </>
            ) : (
              "Share"
            )}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}

export default ShareModal;
