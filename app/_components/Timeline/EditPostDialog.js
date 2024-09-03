import React, { useEffect, useState } from "react";
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";

const EditPostDialog = ({ post, isOpen, onClose, onUpdate, isEditingPost }) => {
  const [description, setDescription] = useState(post?.description);

  const handleDescriptionChange = (event) => {
    setDescription(event.target.value);
  };

  const handleUpdate = () => {
    onUpdate({ postId: post?.postId, description });
  };

  useEffect(() => {
    if (post) {
      setDescription(post.description);
    }
  }, [post]);

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          padding: 4,
        },
      }}
    >
      <DialogTitle>Edit Post</DialogTitle>
      <DialogContent>
        <TextField
          label="Description"
          fullWidth
          multiline
          value={description}
          onChange={handleDescriptionChange}
        />
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onClose}
          variant="outlined"
          color="primary"
          disabled={isEditingPost}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleUpdate}
          color="primary"
          disabled={isEditingPost}
        >
          {isEditingPost ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            "Update"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditPostDialog;
