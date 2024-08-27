"use client";

import BookmarkSvg from "@/app/_components/Icons/BookmarkSvg";
import CommentSvg from "@/app/_components/Icons/CommentSvg";
import HeartUnfilledSvg from "@/app/_components/Icons/HeartUnfilledSvg";
import HistorySvg from "@/app/_components/Icons/HistorySvg";
import PostComments from "@/app/_components/Timeline/PostComments";
import SkeletonPlaceholder from "@/app/_components/Timeline/SkeletonPlaceholder";
import { useMovies } from "@/app/_context/MoviesContext";
import { formatPostTime } from "@/app/_utils/utilities";
import { MoreHoriz } from "@mui/icons-material";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  CircularProgress,
  Collapse,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import Image from "next/image";
import { useState } from "react";
import ReactPlayer from "react-player";
import { toast } from "react-toastify";

const CommentItem = ({ comment }) => (
  <Box
    sx={{
      backgroundColor: "#313131",
      padding: "8px",
      borderRadius: "8px",
      mb: 1,
    }}
  >
    <Typography variant="body2" color="text.primary">
      <strong>{comment.user}</strong>: {comment.text}
    </Typography>
  </Box>
);

const PostCard = ({
  user,
  movie,
  onLike,
  onComment,
  onWatchList,
  onMovieHistory,
  postTime,
  postId,
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [isCommentBoxOpen, setIsCommentBoxOpen] = useState(false);
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [isOpenAll, setIsOpenAll] = useState(true);
  const [imageLoading, setImageLoading] = useState(true);
  const [videoLoading, setVideoLoading] = useState(true);
  const { state } = useMovies();

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAddComment = async () => {
    if (newComment.trim()) {
      try {
        setIsAddingComment(true);
        await onComment(newComment);
        setNewComment("");
      } catch (error) {
        console.error("Error adding comment:", error);
        toast.error("Failed to add comment");
      } finally {
        setIsAddingComment(false);
      }
    }
  };

  const toggleCommentBox = () => {
    setIsCommentBoxOpen((isOpen) => !isOpen);
  };

  const formattedPostTime = formatPostTime(new Date(postTime));

  return (
    <Card elevation={3} sx={{ mb: 3 }}>
      <CardHeader
        avatar={<Avatar alt={user?.username} src={user?.avatarUrl} />}
        action={
          <div>
            <IconButton aria-label="settings" onClick={handleMenuOpen}>
              <MoreHoriz />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={handleMenuClose}>Edit</MenuItem>
              <MenuItem onClick={handleMenuClose}>Delete</MenuItem>
            </Menu>
          </div>
        }
        title={
          <Typography variant="body1">
            {user?.username} · {formattedPostTime}{" "}
          </Typography>
        }
        subheader={movie.title}
      />
      <CardContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {movie.description}
        </Typography>
        <Box
          sx={{
            position: "relative",
            height: "500px",
            overflow: "hidden",
            borderRadius: "8px",
            objectFit: "contain",
          }}
        >
          {movie.videoUrl ? (
            movie.videoUrl.includes("dailymotion") ? (
              <>
                {videoLoading && (
                  <SkeletonPlaceholder width="100%" height="100%" />
                )}
                <iframe
                  src={movie.videoUrl}
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  allow="autoplay; fullscreen"
                  allowFullScreen
                  style={{ display: videoLoading ? "none" : "block" }}
                  onLoad={() => setVideoLoading(false)}
                />
              </>
            ) : (
              <>
                {videoLoading && (
                  <SkeletonPlaceholder width="100%" height="100%" />
                )}
                <ReactPlayer
                  url={movie.videoUrl}
                  width="100%"
                  height="100%"
                  controls
                  playing={false}
                  onReady={() => setVideoLoading(false)}
                  style={{ display: videoLoading ? "none" : "block" }}
                />
              </>
            )
          ) : (
            <>
              {imageLoading && (
                <SkeletonPlaceholder width="100%" height="500px" />
              )}
              <Image
                src={movie.imageUrl}
                alt={movie.title}
                fill
                style={{
                  objectFit: "cover",
                  display: imageLoading ? "none" : "block",
                }}
                sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority
                onLoad={() => setImageLoading(false)}
              />
            </>
          )}
        </Box>
      </CardContent>
      <CardActions disableSpacing sx={{ flexDirection: "column" }}>
        <Box
          sx={{
            mb: 1,
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            width: "100%",
          }}
        >
          <Typography variant="body2" color="text.secondary">
            {movie.likesCount} Likes · {movie.commentsCount} Comments
          </Typography>
        </Box>
        <Divider
          sx={{
            borderColor: "#313131",
            borderWidth: "1.2px",
            borderStyle: "solid",
            width: "100%",
          }}
        />
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-evenly",
            width: "100%",
          }}
        >
          <Box
            sx={{
              textAlign: "center",
              "&:hover": {
                backgroundColor: "rgba(0, 0, 0, 0.1)",
                cursor: "pointer",
              },
              flexGrow: 1,
            }}
            onClick={onLike}
          >
            <IconButton aria-label="like post" disableRipple>
              <HeartUnfilledSvg />
            </IconButton>
            <Typography variant="caption">Like</Typography>
          </Box>
          <Box
            sx={{
              textAlign: "center",
              "&:hover": {
                backgroundColor: "rgba(0, 0, 0, 0.1)",
                cursor: "pointer",
              },
              flexGrow: 1,
            }}
            onClick={toggleCommentBox}
          >
            <IconButton aria-label="comment" disableRipple>
              <CommentSvg />
            </IconButton>
            <Typography variant="caption">Comment</Typography>
          </Box>
          <Box
            sx={{
              textAlign: "center",
              "&:hover": {
                backgroundColor: "rgba(0, 0, 0, 0.1)",
                cursor: "pointer",
              },
              flexGrow: 1,
            }}
            onClick={onWatchList}
          >
            <IconButton aria-label="bookmark" disableRipple>
              <BookmarkSvg />
            </IconButton>
            <Typography variant="caption">WatchList</Typography>
          </Box>
          <Box
            sx={{
              textAlign: "center",
              "&:hover": {
                backgroundColor: "rgba(0, 0, 0, 0.1)",
                cursor: "pointer",
              },
              flexGrow: 1,
            }}
            onClick={onMovieHistory}
          >
            <IconButton aria-label="bookmark" disableRipple>
              <HistorySvg />
            </IconButton>
            <Typography variant="caption">History</Typography>
          </Box>
        </Box>
      </CardActions>
      <Collapse in={isOpenAll} timeout="auto" unmountOnExit>
        <CardContent>
          <Collapse in={isCommentBoxOpen} timeout="auto" unmountOnExit>
            <TextField
              fullWidth
              multiline
              variant="outlined"
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              sx={{
                mb: 2,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                },
              }}
            />
            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Button
                variant="contained"
                onClick={handleAddComment}
                disabled={newComment.trim() == "" || isAddingComment}
              >
                {isAddingComment ? (
                  <>
                    <CircularProgress size={20} color="inherit" />
                  </>
                ) : (
                  "Comment"
                )}
              </Button>
            </Box>
          </Collapse>

          <Divider sx={{ my: 2 }} />
          <PostComments postId={postId} movie={movie} />
        </CardContent>
      </Collapse>
    </Card>
  );
};

export default PostCard;
