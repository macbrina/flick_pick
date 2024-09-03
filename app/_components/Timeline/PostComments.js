"use client";

import DeleteDialog from "@/app/_components/DeleteDialog";
import { useMovies } from "@/app/_context/MoviesContext";
import { db } from "@/app/_firebase/config";
import { deleteComment, getPostComments } from "@/app/_lib/data-service";
import { useIsUserLoggedIn } from "@/app/_utils/auth";
import { formatPostTime } from "@/app/_utils/utilities";
import { DeleteOutline } from "@mui/icons-material";
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { useEffect, useOptimistic, useState, useTransition } from "react";
import { toast } from "react-toastify";

const PostComments = ({ postId, movie }) => {
  const { state, increasePostComments, addToComments, removeFromComments } =
    useMovies();
  const { isLoggedIn, user } = useIsUserLoggedIn();
  const [selectedId, setSelectedId] = useState(null);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [deletePending, setDeletePending] = useState({});

  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [isPending, startTransistion] = useTransition();
  const [commentState, setCommentState] = useState({
    lastComment: null,
    loadingMore: false,
    allCommentsLoaded: false,
    initialLoad: true,
  });

  const [optimisticComments, optimisticDelete] = useOptimistic(
    state.comments,
    (curComments, commentId) =>
      curComments.filter((comment) => comment.id !== commentId)
  );

  function handleDeleteConfirm() {
    setShowDeleteConfirmation(false);
    startTransistion(() => handleDeleteComment());
  }

  const handleDeleteClick = (commentId, postId) => {
    setShowDeleteConfirmation(true);
    setSelectedId(commentId);
    setSelectedPostId(postId);
    setDeletePending((prev) => ({ ...prev, [commentId]: true }));
  };

  const handleDeleteClose = () => {
    setShowDeleteConfirmation(false);
    setDeletePending((prev) => ({ ...prev, [selectedId]: false }));
  };

  const handleDeleteComment = async () => {
    if (!isLoggedIn) {
      toast.error("You need to be logged in to comment.");
      return;
    }

    try {
      optimisticDelete(selectedId);
      await deleteComment(selectedId, selectedPostId);
      setSelectedId(null);
      setSelectedPostId(null);
      increasePostComments(postId, "remove");
    } catch (error) {
      toast.error("Failed to delete comment.");
    } finally {
      setDeletePending((prev) => ({ ...prev, [selectedId]: false }));
    }
  };

  useEffect(() => {
    const commentsRef = collection(db, "comments");
    let q = query(
      commentsRef,
      where("postId", "==", postId),
      orderBy("createdAt", "desc"),
      limit(3)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const isFirstLoad = commentState.initialLoad;

      querySnapshot.docChanges().forEach((change) => {
        const commentData = { id: change.doc.id, ...change.doc.data() };

        if (change.type === "added") {
          const commentExists = state.comments.some(
            (comment) => comment.id === commentData.id
          );

          if (!commentExists) {
            addToComments(commentData);
          }
        } else if (change.type === "removed") {
          if (state.comments.some((comment) => comment.id === commentData.id)) {
            removeFromComments(commentData.id);
          }
        }
      });

      if (querySnapshot.docs.length > 0) {
        setCommentState((prev) => ({
          ...prev,
          lastComment: querySnapshot.docs[querySnapshot.docs.length - 1],
          allCommentsLoaded: querySnapshot.docs.length < 3,
        }));
      } else {
        setCommentState((prev) => ({ ...prev, allCommentsLoaded: true }));
      }

      if (isFirstLoad) {
        setCommentState((prev) => ({ ...prev, initialLoad: false }));
      }
    });

    return () => unsubscribe();
  }, [
    postId,
    addToComments,
    removeFromComments,
    state.comments,
    commentState.initialLoad,
  ]);

  const handleLoadMoreComments = async () => {
    if (commentState.lastComment && !commentState.allCommentsLoaded) {
      setCommentState((prev) => ({ ...prev, loadingMore: true }));
      try {
        const { comments, lastVisible } = await getPostComments(
          postId,
          commentState.lastComment
        );

        if (comments.length > 0) {
          comments.forEach((comment) => {
            if (comment.postId === postId) {
              addToComments(comment);
            }
          });
          setCommentState((prev) => ({
            ...prev,
            lastComment: lastVisible,
            allCommentsLoaded: comments.length < 3,
          }));
        }
      } catch (error) {
        console.error("Error loading more comments:", error);
      } finally {
        setCommentState((prev) => ({ ...prev, loadingMore: false }));
      }
    } else {
      console.log("No more comments to load");
    }
  };

  const postComments = optimisticComments
    .filter((comment) => comment.postId === postId)
    .sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);

  return (
    <div>
      <div>
        {postComments.length > 0 &&
          postComments.map((comment) => (
            <Box
              key={comment.id}
              sx={(theme) => ({
                backgroundColor:
                  theme.palette.mode == "dark" ? "#313131" : "#f2f2f2",
                padding: "8px",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                p: 1,
                position: "relative",
                cursor: "pointer",
                mb: 1,
              })}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar alt={comment.username} src={comment.avatarUrl} />
                <Stack direction="column">
                  <Stack direction="row" spacing={3}>
                    <Typography variant="body2">
                      <strong>{comment.username}</strong> .{" "}
                      {formatPostTime(
                        new Date(comment.createdAt.seconds * 1000)
                      )}
                    </Typography>
                  </Stack>
                  <Typography variant="body2">{comment.text}</Typography>
                </Stack>
              </Stack>
              {isLoggedIn && user.id == comment.userId && (
                <Tooltip title="Delete Comment">
                  <span>
                    <IconButton
                      onClick={() =>
                        handleDeleteClick(comment.id, comment.postId)
                      }
                      disabled={deletePending[comment.id] || isPending}
                    >
                      {deletePending[comment.id] ? (
                        <CircularProgress />
                      ) : (
                        <DeleteOutline />
                      )}
                    </IconButton>
                  </span>
                </Tooltip>
              )}
            </Box>
          ))}
      </div>
      {!commentState.allCommentsLoaded &&
        postComments.length < movie.commentsCount && (
          <Button
            onClick={handleLoadMoreComments}
            disabled={commentState.loadingMore}
          >
            {commentState.loadingMore ? "Loading..." : "Load more comments"}
          </Button>
        )}

      <DeleteDialog
        onOpen={showDeleteConfirmation}
        onClose={handleDeleteClose}
        onDelete={handleDeleteConfirm}
        title="comment"
      />
    </div>
  );
};

export default PostComments;
