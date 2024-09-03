"use client";

import BookmarkSvg from "@/app/_components/Icons/BookmarkSvg";
import CommentSvg from "@/app/_components/Icons/CommentSvg";
import HeartUnfilledSvg from "@/app/_components/Icons/HeartUnfilledSvg";
import HistorySvg from "@/app/_components/Icons/HistorySvg";
import PostComments from "@/app/_components/Timeline/PostComments";
import SkeletonPlaceholder from "@/app/_components/Timeline/SkeletonPlaceholder";
import { useMovies } from "@/app/_context/MoviesContext";
import { formatNumber, formatPostTime } from "@/app/_utils/utilities";
import { Close, MoreHoriz } from "@mui/icons-material";
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
  Modal,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import Image from "next/image";
import { memo, useEffect, useRef, useState } from "react";
import ReactPlayer from "react-player";
import { toast } from "react-toastify";
import SendSvg from "../Icons/SendSvg";
import HeartfilledSvg from "../Icons/HeartFilledSvg";
import {
  addComment,
  toggleHistory,
  toggleLike,
  toggleWatchList,
} from "@/app/_lib/data-service";
import { useIsUserLoggedIn } from "@/app/_utils/auth";
import { useNotification } from "@/app/_context/NotificationContext";
import BookmarkFilledSVg from "../Icons/BookmarkFilledSVg";
import StarRating from "../StarRating";
import HistoryFilledSvg from "../Icons/HistoryFilledSvg";

const BoxData = ({ children }) => {
  return (
    <Box
      sx={{
        mb: 1,
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
        gap: 0.3,
      }}
    >
      {children}
    </Box>
  );
};

function checkIfAlreadyLiked(posts, postId) {
  const post = posts.find((post) => post.id === postId);
  return post?.userLiked || false;
}

function checkIfAlreadyWatched(posts, postId) {
  const post = posts.find((post) => post.id === postId);
  return post?.userWatch || false;
}

function checkIfAlreadyHistory(posts, postId) {
  const post = posts.find((post) => post.id === postId);
  return post?.userHistory || false;
}

const PostCard = ({
  user,
  movie,
  theme,
  postTime,
  postId,
  notify,
  onPostDelete,
  isPendingDelete,
  isPendingEdit,
  onEditOpen,
  onOpenAuth,
}) => {
  const cooldownTime = 1000;
  const [anchorEl, setAnchorEl] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [isCommentBoxOpen, setIsCommentBoxOpen] = useState(true);
  const [isAddingComment, setIsAddingComment] = useState(false);
  const { isLoggedIn, userId, user: loggedInUser } = useIsUserLoggedIn();
  const [isOpenAll, setIsOpenAll] = useState(true);
  const [imageLoading, setImageLoading] = useState(true);
  const [videoLoading, setVideoLoading] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const {
    state,
    increasePostLikes,
    dispatch,
    increasePostComments,
    increasePostWatchList,
    increasePostHistory,
  } = useMovies();

  const countRef = useRef(0);

  const [isUpdatingLike, setIsUpdatingLike] = useState(false);
  const [openRatingModals, setOpenRatingModals] = useState({});
  const [isUpdatingWatchlist, setIsUpdatingWatchlist] = useState(false);
  const [lastWatchActionTime, setLastWatchActionTime] = useState(0);
  const [isUpdatingHistory, setIsUpdatingHistory] = useState(false);
  const [lastLikeActionTime, setLastLikeActionTime] = useState(0);
  const [firstLoad, setFirstLoad] = useState(true);

  const [lastHistoryActionTime, setLastHistoryActionTime] = useState(0);

  const [isLiked, setIsLiked] = useState(
    checkIfAlreadyLiked(state.publicPosts, postId)
  );
  const [isWatchList, setIsWatchList] = useState(
    checkIfAlreadyWatched(state.publicPosts, postId)
  );
  const [userRating, setUserRating] = useState("");
  const [isHistory, setIsHistory] = useState(
    checkIfAlreadyHistory(state.publicPosts, postId)
  );

  useEffect(() => {
    if (firstLoad) {
      setIsLiked(checkIfAlreadyLiked(state.publicPosts, postId));
      setIsWatchList(checkIfAlreadyWatched(state.publicPosts, postId));
      setIsHistory(checkIfAlreadyHistory(state.publicPosts, postId));
      setFirstLoad(false);
    }
  }, [state.publicPosts, postId, firstLoad]);

  const handleError = () => {
    setVideoError(true);
    setVideoLoading(false);
  };

  const handleReady = () => {
    setVideoLoading(false);
    setVideoError(false);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handlePostDelete = async () => {
    setAnchorEl(null);
    await onPostDelete();
  };

  const handleOpenRating = (postId) => {
    setOpenRatingModals((prevState) => ({ ...prevState, [postId]: true }));
  };

  const handleCloseRating = (postId) => {
    setOpenRatingModals((prevState) => ({ ...prevState, [postId]: false }));
  };

  const handleEditOpen = () => {
    handleMenuClose();
    onEditOpen();
  };

  const handleAddComment = async () => {
    if (!isLoggedIn) {
      notify("You need to be logged in to comment.", "error");
      return;
    }

    if (newComment.trim()) {
      setNewComment("");

      const commentData = {
        postId,
        userId,
        text: newComment,
        username: loggedInUser.username,
        avatarUrl: loggedInUser.imageUrl,
      };

      try {
        setIsAddingComment(true);
        await addComment(commentData);
        increasePostComments(postId, "add");
      } catch (error) {
        console.error("Error adding comment:", error);
        notify("Failed to add comment.", "error");
      } finally {
        setIsAddingComment(false);
      }
    }
  };

  const toggleUILike = () => setIsLiked((prevLiked) => !prevLiked);

  const toggleUIWatch = () => setIsWatchList((prevWatched) => !prevWatched);

  const toggleUIHistory = () => setIsHistory((prevHistory) => !prevHistory);

  useEffect(
    function () {
      if (userRating) countRef.current++;
    },
    [userRating]
  );

  useEffect(() => {
    if (isLoggedIn) {
      setIsOpenAll(true);
    } else {
      setIsOpenAll(false);
    }
  }, [isLoggedIn]);

  const handleMovieHistory = async () => {
    if (!isLoggedIn) {
      notify("You need to be logged in to add to your history.", "error");
      return;
    }

    if (!isHistory && !userRating) return;

    const now = Date.now();

    if (now - lastHistoryActionTime < cooldownTime) {
      notify("Please wait a moment before adding again..", "error");
      return;
    }

    setLastHistoryActionTime(now);

    const operation = isHistory ? "remove" : "add";
    increasePostHistory(postId, operation);

    if (isUpdatingHistory) return;

    setIsUpdatingHistory(true);

    const newWatchedMovie = {
      userId: userId,
      postId,
      movieId: movie.movieId,
      movieType: movie.movieType,
      title: movie.title,
      release_date: movie.release_date,
      poster_path: movie.imageUrl,
      tmdbRating: movie.tmdbRating,
      runtime: movie.runtime,
      userRating,
      countRatingDecisions: countRef.current,
    };

    try {
      const serverOperation = await toggleHistory(newWatchedMovie);

      if (serverOperation == operation && !isHistory) {
        setIsHistory(true);
      }

      if (serverOperation !== operation) {
        increasePostHistory(postId, serverOperation);
        setIsHistory(serverOperation === "add");
      }

      dispatch({
        type: "TOGGLE_USER_HISTORY",
        payload: {
          postId,
          history: serverOperation === "add",
        },
      });
    } catch (error) {
      console.error(error);
      toggleUIHistory();
      increasePostHistory(postId, isHistory ? "add" : "remove");
      setIsHistory(isWatchList);
    } finally {
      setIsUpdatingHistory(false);
    }
    console.log(`Added movie to history ${postId}`);
  };

  const handleWatchList = async () => {
    if (!isLoggedIn) {
      notify("You need to be logged in to add to your watchlist.", "error");
      return;
    }

    const now = Date.now();

    if (now - lastWatchActionTime < cooldownTime) {
      notify("Please wait a moment before adding again..", "error");
      return;
    }

    setLastWatchActionTime(now);

    const operation = isWatchList ? "remove" : "add";
    increasePostWatchList(postId, operation);

    if (isUpdatingWatchlist) return;

    setIsUpdatingWatchlist(true);

    const newWatchedMovie = {
      userId: userId,
      postId,
      movieId: movie.movieId,
      movieType: movie.movieType,
      title: movie.title,
      release_date: movie.release_date,
      poster_path: movie.imageUrl,
      tmdbRating: movie.tmdbRating,
      runtime: movie.runtime,
    };

    try {
      const serverOperation = await toggleWatchList(newWatchedMovie);

      if (serverOperation == operation && !isWatchList) {
        setIsWatchList(true);
      }

      if (serverOperation !== operation) {
        increasePostWatchList(postId, serverOperation);
        setIsWatchList(serverOperation === "add");
      }

      dispatch({
        type: "TOGGLE_USER_WATCHLIST",
        payload: {
          postId,
          watched: serverOperation === "add",
        },
      });
    } catch (error) {
      console.error(error);
      toggleUIWatch();
      increasePostWatchList(postId, isWatchList ? "add" : "remove");
      setIsWatchList(isWatchList);
    } finally {
      setIsUpdatingWatchlist(false);
    }
  };

  const handleLike = async () => {
    if (!isLoggedIn) {
      notify("You need to be logged in to like a post", "error");
      return;
    }

    const now = Date.now();
    if (now - lastLikeActionTime < cooldownTime) {
      notify("Please wait a moment before liking again..", "error");
      return;
    }

    setLastLikeActionTime(now);

    const operation = isLiked ? "remove" : "add";
    increasePostLikes(postId, operation);

    if (isUpdatingLike) return;

    setIsUpdatingLike(true);

    try {
      const serverOperation = await toggleLike(userId, postId);

      if (serverOperation == operation && !isLiked) {
        setIsLiked(true);
      }

      if (serverOperation !== operation) {
        increasePostLikes(postId, serverOperation);
        setIsLiked(serverOperation === "add");
      }

      dispatch({
        type: "TOGGLE_USER_LIKE",
        payload: {
          postId,
          liked: serverOperation === "add",
        },
      });
    } catch (error) {
      console.error(error);
      toggleUILike();
      increasePostLikes(postId, isLiked ? "add" : "remove");
      setIsLiked(isLiked);
      notify("An error occurred while trying to like the post.", "error");
    } finally {
      setIsUpdatingLike(false);
    }
  };

  const toggleCommentBox = () => {
    setIsCommentBoxOpen((isOpen) => !isOpen);
  };

  const formattedPostTime = formatPostTime(new Date(postTime));

  console.log("POSTCARD", user.id, movie.userId);

  return (
    <>
      <Card
        elevation={3}
        sx={(theme) => ({
          mb: 3,
          backgroundImage: theme.palette.mode == "dark" ? "none" : "",
          borderRadius: "20px",
        })}
      >
        <CardHeader
          avatar={<Avatar alt={user?.username} src={user?.avatarUrl} />}
          action={
            <div>
              {isLoggedIn && user.id == movie.userId && (
                <>
                  <IconButton aria-label="settings" onClick={handleMenuOpen}>
                    <MoreHoriz />
                  </IconButton>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                  >
                    <MenuItem onClick={handleEditOpen} disabled={isPendingEdit}>
                      Edit
                    </MenuItem>
                    <MenuItem
                      onClick={handlePostDelete}
                      disabled={isPendingDelete}
                    >
                      Delete
                    </MenuItem>
                  </Menu>
                </>
              )}
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
                  {videoError ? (
                    <Image
                      src={
                        !movie.imageUrl
                          ? "/images/placeholder.png"
                          : `${movie.imageUrl}`
                      }
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
                  ) : (
                    <ReactPlayer
                      url={movie.videoUrl}
                      width="100%"
                      height="100%"
                      controls
                      playing={false}
                      onError={handleError}
                      onReady={handleReady}
                      style={{ display: videoLoading ? "none" : "block" }}
                    />
                  )}
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
              width: "98%",
              gap: 2,
            }}
          >
            <BoxData>
              <HeartUnfilledSvg style={{ width: "15px", height: "15px" }} />{" "}
              <Typography
                variant="body2"
                color="text.secondary"
                fontSize="15px"
              >
                {formatNumber(movie.likesCount)} Likes
              </Typography>
            </BoxData>
            <BoxData>
              <CommentSvg style={{ width: "15px", height: "15px" }} />{" "}
              <Typography
                variant="body2"
                color="text.secondary"
                fontSize="15px"
              >
                {formatNumber(movie.commentsCount)} Comments
              </Typography>{" "}
            </BoxData>
            <BoxData>
              <BookmarkSvg style={{ width: "15px", height: "15px" }} />{" "}
              <Typography
                variant="body2"
                color="text.secondary"
                fontSize="15px"
              >
                {formatNumber(movie.watchListCount)} Watchlist
              </Typography>{" "}
            </BoxData>
            <BoxData>
              <HistorySvg style={{ width: "15px", height: "15px" }} />{" "}
              <Typography
                variant="body2"
                color="text.secondary"
                fontSize="15px"
              >
                {formatNumber(movie.historyCount)} History
              </Typography>{" "}
            </BoxData>
          </Box>
          <Divider
            sx={(theme) => ({
              borderColor: theme.palette.mode == "dark" ? "#313131" : "#ebe7ed",
              borderWidth: "1.2px",
              borderStyle: "solid",
              width: "100%",
            })}
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
              onClick={() => {
                if (isLoggedIn) {
                  toggleUILike();
                  setTimeout(() => {
                    handleLike();
                  }, 100);
                } else {
                  onOpenAuth();
                }
              }}
            >
              <IconButton aria-label="like post" disableRipple>
                {isLiked ? <HeartfilledSvg /> : <HeartUnfilledSvg />}
              </IconButton>
              <Typography
                variant="caption"
                sx={(theme) => ({
                  display: { xs: "none", sm: "unset", md: "unset" },
                  color: isLiked ? "#FF4F40" : "text.secondary",
                })}
              >
                Like
              </Typography>
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
              onClick={() => {
                if (isLoggedIn) {
                  toggleCommentBox();
                } else {
                  onOpenAuth();
                }
              }}
            >
              <IconButton aria-label="comment" disableRipple>
                <CommentSvg />
              </IconButton>
              <Typography
                variant="caption"
                sx={{ display: { xs: "none", sm: "unset", md: "unset" } }}
              >
                Comment
              </Typography>
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
              onClick={() => {
                if (isLoggedIn) {
                  toggleUIWatch();
                  setTimeout(() => {
                    handleWatchList();
                  }, 100);
                } else {
                  onOpenAuth();
                }
              }}
            >
              <IconButton aria-label="bookmark" disableRipple>
                {isWatchList ? <BookmarkFilledSVg /> : <BookmarkSvg />}
              </IconButton>
              <Typography
                variant="caption"
                sx={{
                  display: { xs: "none", sm: "unset", md: "unset" },
                  color: isWatchList ? "#378fe9" : "text.secondary",
                }}
              >
                WatchList
              </Typography>
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
              onClick={(event) => {
                event.stopPropagation();

                if (isLoggedIn) {
                  if (!isHistory) {
                    handleOpenRating(postId);
                  } else {
                    toggleUIHistory();
                    setTimeout(handleMovieHistory, 100);
                  }
                } else {
                  onOpenAuth();
                }
              }}
            >
              <IconButton aria-label="bookmark" disableRipple>
                {isHistory ? <HistoryFilledSvg /> : <HistorySvg />}
              </IconButton>
              <Typography
                variant="caption"
                sx={{
                  display: { xs: "none", sm: "unset", md: "unset" },
                  color: isHistory ? "#6a9955" : "text.secondary",
                }}
              >
                History
              </Typography>

              <Modal
                open={openRatingModals[postId]}
                onClose={(event) => {
                  event.stopPropagation();
                  handleCloseRating(postId);
                }}
                aria-labelledby="rating-modal-title"
                aria-describedby="rating-modal-description"
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    bgcolor: "background.paper",
                    borderRadius: 2,
                    boxShadow: 24,
                    p: 4,
                  }}
                >
                  <Typography
                    id="rating-modal-title"
                    sx={{ mb: 2, mt: 3, textAlign: "center" }}
                  >
                    {movie.title}
                  </Typography>
                  <button
                    className="btn-toggle"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleCloseRating(postId);
                    }}
                  >
                    <Tooltip title="Close">
                      <Close sx={{ color: "#fff" }} />
                    </Tooltip>
                  </button>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    <StarRating
                      color={
                        theme.palette.mode == "dark" ? "#fcc419" : "#6741D9"
                      }
                      maxRating={10}
                      size={24}
                      onSetRating={setUserRating}
                    />
                    <Button
                      variant="contained"
                      sx={{ mt: 3 }}
                      disabled={isUpdatingHistory || !userRating}
                      onClick={(event) => {
                        event.stopPropagation();
                        handleCloseRating(postId);
                        toggleUIHistory();
                        setTimeout(() => {
                          handleMovieHistory();
                        }, 100);
                      }}
                    >
                      {isUpdatingHistory ? (
                        <>
                          <CircularProgress size={20} color="inherit" />{" "}
                          Adding...
                        </>
                      ) : (
                        "Add to History"
                      )}
                    </Button>
                  </Box>
                </Box>
              </Modal>
            </Box>
          </Box>
        </CardActions>
        <Collapse in={isOpenAll} timeout="auto" unmountOnExit>
          <CardContent>
            <Collapse in={isCommentBoxOpen} timeout="auto" unmountOnExit>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <TextField
                  fullWidth
                  multiline
                  variant="outlined"
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey && !isAddingComment) {
                      e.preventDefault();
                      handleAddComment();
                    }
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "8px",
                    },
                  }}
                />

                <Button
                  variant="contained"
                  onClick={handleAddComment}
                  disabled={newComment.trim() == "" || isAddingComment}
                  sx={{
                    minWidth: "4px !important",
                    padding: "4px 10px",
                    borderRadius: "50% !important",
                  }}
                >
                  {isAddingComment ? (
                    <>
                      <CircularProgress size={20} color="inherit" />
                    </>
                  ) : (
                    <SendSvg />
                  )}
                </Button>
              </Box>
            </Collapse>

            <Divider sx={{ my: 2 }} />
            <PostComments postId={postId} movie={movie} />
          </CardContent>
        </Collapse>
      </Card>
    </>
  );
};

export default memo(PostCard);
