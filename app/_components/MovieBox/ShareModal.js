"use client";

import { Close } from "@mui/icons-material";
import {
  Box,
  Button,
  CircularProgress,
  Grid,
  Modal,
  Skeleton,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import Image from "next/image";
import { useState } from "react";

function ShareModal({ movie, open, onClose, onShare, isSharing }) {
  const [postContent, setPostContent] = useState("");
  const [imageLoading, setImageLoading] = useState(true);

  const handleShare = async () => {
    await onShare(postContent);
    setPostContent("");
    // onClose();
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
        <button className="btn-toggle" onClick={onClose}>
          <Tooltip title="Close">
            <Close sx={{ color: "#fff" }} />
          </Tooltip>
        </button>

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
              <Grid item xs={12}>
                <TextField
                  label="Your Post"
                  fullWidth
                  multiline
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  variant="outlined"
                  sx={{ marginBottom: "15px" }}
                />
              </Grid>
              <Box
                sx={{
                  position: "relative",
                  height: "200px",
                  overflow: "hidden",
                  borderRadius: "8px",
                  objectFit: "cover",
                }}
              >
                {imageLoading && (
                  <Skeleton
                    height="200px"
                    width="100%"
                    variant="rectangular"
                    animation="pulse"
                  />
                )}
                <Image
                  src={
                    !movie.poster_path
                      ? "/images/placeholder.png"
                      : `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                  }
                  alt={movie.title}
                  fill
                  style={{
                    objectFit: "contain",
                    display: imageLoading ? "none" : "block",
                  }}
                  sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  priority
                  onLoad={() => setImageLoading(false)}
                />
              </Box>
            </Box>
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
                <CircularProgress size={20} color="inherit" />
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
