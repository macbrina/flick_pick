"use client";

import NoPostsCard from "@/app/_components/Timeline/NoPostsCard";
import PostCard from "@/app/_components/Timeline/PostCard";
import PostSearchForm from "@/app/_components/Timeline/PostSearchForm";
import { useMovies } from "@/app/_context/MoviesContext";
import { usePostSearchMovie } from "@/app/_hooks/usePostSearchMovie";
import { Close } from "@mui/icons-material";
import {
  Box,
  CircularProgress,
  Grid,
  Modal,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useState } from "react";
import EditPostDialog from "@/app/_components/Timeline/EditPostDialog";
import { useIsUserLoggedIn } from "@/app/_utils/auth";

const TimelineFeed = ({
  posts,
  onPostDelete,
  isPostFinished,
  isLoadingMorePost,
  theme,
  notify,
  pendingDeletes,
  pendingEdits,
  onEditConfirm,
  onEditOpen,
  onEditClose,
  isEditOpen,
  isEditingPost,
  currentPost,
  onOpenAuth,
}) => {
  const { state, dispatch } = useMovies();
  const { isLoggedIn } = useIsUserLoggedIn();
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("md"));
  const [movieName, setMovieName] = useState("");
  const [type, setType] = useState("movie");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { searchList, error } = usePostSearchMovie({
    movieName,
    type,
  });

  const handleOpen = (event) => {
    event.preventDefault();
    setIsModalOpen(true);
  };

  const handleClose = (event) => {
    setIsModalOpen(false);
    dispatch({ type: "SET_POST_SELECTED_ID", payload: null });
  };

  return (
    <Grid container justifyContent="center" sx={{ height: "100%" }}>
      <Grid item xs={12} sm={12} md={10}>
        <Box sx={{ flexGrow: 1, marginTop: 2, marginBottom: 4 }}>
          <TextField
            label="Search Movies..."
            value={""}
            name="movieName"
            onClick={() => {
              if (isLoggedIn) {
                handleOpen();
              } else {
                onOpenAuth();
              }
            }}
            fullWidth
            aria-disabled
            inputProps={{ readOnly: true, style: { cursor: "pointer" } }}
            sx={{
              mb: 2,
              marginBottom: "0px",
              padding: "0px",
              borderRadius: "0px",
              "& .MuiOutlinedInput-root": { padding: "0px" },
            }}
          />
        </Box>
      </Grid>
      <Modal
        open={isModalOpen}
        onClose={handleClose}
        aria-labelledby="post-modal-title"
        aria-describedby="post-modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: isMobile ? "90%" : "60%",
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
            overflow: "hidden",
          }}
        >
          {!state.postSelectedId && (
            <Typography textAlign="center" id="post-modal-title" gutterBottom>
              Search Movies
            </Typography>
          )}
          <button className="btn-toggle" onClick={handleClose}>
            <Tooltip title="Close">
              <Close sx={{ color: "#fff" }} />
            </Tooltip>
          </button>
          <PostSearchForm
            onClose={handleClose}
            movieName={movieName}
            type={type}
            searchList={searchList}
            error={error}
            onChangeMovieName={(movieName) => setMovieName(movieName)}
            onChangeType={(type) => setType(type)}
          />
        </Box>
      </Modal>

      {posts.length > 0 &&
        posts.map((post) => (
          <Grid item xs={12} sm={12} md={10} key={post.postId}>
            <PostCard
              notify={notify}
              theme={theme}
              user={post.user}
              movie={post.movie}
              onPostDelete={() => onPostDelete(post.postId)}
              postId={post.postId}
              postTime={post.postTime}
              isPendingDelete={pendingDeletes.get(post.postId)}
              isPendingEdit={pendingEdits.get(post.postId)}
              onEditOpen={() => onEditOpen(post.movie)}
              onOpenAuth={onOpenAuth}
            />
            <EditPostDialog
              post={currentPost}
              onClose={onEditClose}
              onUpdate={onEditConfirm}
              isOpen={isEditOpen}
              isEditingPost={isEditingPost}
            />
          </Grid>
        ))}
      {posts.length == 0 && !state.publicPostLoading && (
        <NoPostsCard onOpenSearch={handleOpen} />
      )}
      <Grid item xs={12}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            mb: 4,
          }}
        >
          {isLoadingMorePost && <CircularProgress size={40} color="inherit" />}
          {isPostFinished && (
            <Typography variant="body1" fontWeight="bold">
              No more posts to load
            </Typography>
          )}
        </Box>
      </Grid>
    </Grid>
  );
};

export default TimelineFeed;
