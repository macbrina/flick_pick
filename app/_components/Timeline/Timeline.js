"use client";

import TimelineFeed from "@/app/_components/Timeline/TimelineFeed";
import { useMovies } from "@/app/_context/MoviesContext";
import {
  deletePost,
  editPost,
  getNewsfeedPosts,
  hasUserHistoryPost,
  hasUserLikedPost,
  hasUserWatchListPost,
  subscribeToNewPosts,
} from "@/app/_lib/data-service";
import { useIsUserLoggedIn } from "@/app/_utils/auth";
import { PAGE_SIZE } from "@/app/_utils/constants";
import { ArrowUpwardRounded } from "@mui/icons-material";
import { Box, Button, Grid, Toolbar, useTheme } from "@mui/material";
import {
  useCallback,
  useEffect,
  useMemo,
  useOptimistic,
  useRef,
  useState,
  useTransition,
} from "react";
import { toast } from "react-toastify";
import PostCardSkeleton from "@/app/_components/Timeline/PostCardSkeleton";
import { useNotification } from "@/app/_context/NotificationContext";
import DeleteDialog from "@/app/_components/DeleteDialog";
import EditPostDialog from "@/app/_components/Timeline/EditPostDialog";
import AuthDialog from "../Auth/AuthDialog";

function Timeline() {
  const theme = useTheme();
  const { notify } = useNotification();
  const { state, loadPostList, dispatch, removeFromPostList } = useMovies();
  const { isLoggedIn, userId, user } = useIsUserLoggedIn();
  const [newPostsAvailable, setNewPostsAvailableLocal] = useState(false);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const containerRef = useRef(null);
  const [lastPostTimestamp, setLastPostTimestamp] = useState(null);
  const [seenPostIds, setSeenPostIds] = useState(new Set());
  const [isLoadingMorePost, setIsLoadingMorePosts] = useState(false);
  const [isPostFinished, setIsPostFinished] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [isPendingDelete, startTransition] = useTransition();
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [pendingDeletes, setPendingDeletes] = useState(new Map());
  const [openEditPosts, setOpenEditPosts] = useState(new Map());
  const [pendingEdits, setPendingEdits] = useState(new Map());
  const [showEditConfirmation, setShowEditConfirmation] = useState(false);
  const [isEditingPost, setIsEditingPost] = useState(false);
  const [currentPost, setCurrentPost] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleOpenDialog = () => {
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const memoizedPostListLength = useMemo(
    () => state.publicPosts.length,
    [state.publicPosts]
  );

  function handleDeleteConfirm() {
    setShowDeleteConfirmation(false);
    startTransition(() => handlePostDeletes(Array.from(selectedIds)));
  }

  const handleDeleteClick = (postId) => {
    setSelectedIds((prev) => new Set(prev).add(postId));
    setShowDeleteConfirmation(true);
  };

  const handleDeleteClose = () => {
    setSelectedIds(new Set());
    setShowDeleteConfirmation(false);
  };

  const handleEditConfirm = (post) => {
    setOpenEditPosts((prev) =>
      new Map(prev).set(post.postId, post.description)
    );
  };

  const handleOpenEdit = (post) => {
    setCurrentPost(post);
    setShowEditConfirmation(true);
  };

  const handleCloseEdit = () => {
    setCurrentPost(null);
    setOpenEditPosts(new Map());
    setShowEditConfirmation(false);
  };

  const [optimisticPosts, optimisticDelete] = useOptimistic(
    state.publicPosts,
    (curPosts, postId) => curPosts.filter((post) => post.id !== postId)
  );

  const handlePostEdits = useCallback(
    async (posts) => {
      if (!isLoggedIn) {
        notify("You need to be logged in to edit your post.", "error");
        return;
      }
      setIsEditingPost(true);

      setPendingEdits((prev) => {
        const updated = new Map(prev);
        posts.forEach(([postId]) => updated.set(postId, true));
        return updated;
      });

      try {
        await Promise.all(
          posts.map(([postId, description]) =>
            editPost({ postId, description })
          )
        );
        posts.map(([postId, description]) =>
          dispatch({
            type: "UPDATE_POST_DESCRIPTION",
            payload: { postId, description },
          })
        );
        notify("Posts successfully edited", "success");

        setPendingEdits((prev) => {
          const updated = new Map(prev);
          posts.forEach(([postId]) => updated.delete(postId));
          return updated;
        });
        handleCloseEdit();
      } catch (error) {
        notify("Error editing posts", "error");

        setPendingEdits((prev) => {
          const updated = new Map(prev);
          posts.forEach(([postId]) => updated.delete(postId));
          return updated;
        });
      } finally {
        setIsEditingPost(false);
      }
    },
    [isLoggedIn, notify]
  );

  useEffect(() => {
    if (openEditPosts.size > 0) {
      const postsToEdit = Array.from(openEditPosts.entries());
      handlePostEdits(postsToEdit);
    }
  }, [openEditPosts, handlePostEdits]);

  const handlePostDeletes = useCallback(
    async (postIds) => {
      if (!isLoggedIn) {
        notify("You need to be logged in to delete your post..", "error");
        return;
      }

      setPendingDeletes((prev) => {
        const updated = new Map(prev);
        postIds.forEach((id) => updated.set(id, true));
        return updated;
      });

      try {
        postIds.forEach((id) => optimisticDelete(id));

        postIds.forEach((id) => {
          removeFromPostList(id);
        });

        await Promise.all(postIds.map((id) => deletePost(id)));
        notify("Post successfully deleted", "success");

        postIds.forEach((id) => {
          setPendingDeletes((prev) => {
            const updated = new Map(prev);
            updated.delete(id);
            return updated;
          });
        });
        setSelectedIds(new Set());
      } catch (error) {
        console.log("error", error);
        notify("Error deleting post", "error");
        postIds.forEach((id) => {
          setPendingDeletes((prev) => {
            const updated = new Map(prev);
            updated.delete(id);
            return updated;
          });
        });
      }
    },
    [isLoggedIn, optimisticDelete, removeFromPostList]
  );

  const fetchInitialPosts = useCallback(async () => {
    try {
      dispatch({ type: "SET_POSTS_LOADING", payload: true });
      const allPosts = await getNewsfeedPosts();

      const postsWithUserLikeStatus = await Promise.all(
        allPosts.map(async (post) => {
          const hasLiked = await hasUserLikedPost(userId, post.id);
          const hasWatchlist = await hasUserWatchListPost(userId, post.id);
          const hasHistory = await hasUserHistoryPost(userId, post.id);
          return {
            ...post,
            userLiked: hasLiked,
            userWatch: hasWatchlist,
            userHistory: hasHistory,
          };
        })
      );

      loadPostList(postsWithUserLikeStatus);

      if (allPosts.length > 0) {
        setLastPostTimestamp(allPosts[allPosts.length - 1].postTime);
        setSeenPostIds(new Set(allPosts.map((post) => post.id)));
      }
    } catch (error) {
      console.error(error);
      notify("Failed to fetch watchlist", "error");
    } finally {
      dispatch({ type: "SET_POSTS_LOADING", payload: false });
      setIsInitialLoad(false);
    }
  }, [dispatch, loadPostList, userId]);

  useEffect(() => {
    if (memoizedPostListLength === 0) {
      fetchInitialPosts();
    }
    const currentUser = userId ? userId : null;

    const unsubscribe = subscribeToNewPosts((newPosts) => {
      const scrollContainer = containerRef.current || window;

      if (scrollContainer && scrollContainer.scrollTop === 0) {
        setLastPostTimestamp(newPosts[newPosts.length - 1]?.postTime);
        loadPostList(newPosts);
      } else {
        if (!isInitialLoad) {
          const hasUnseenPosts = newPosts.some(
            (post) => !seenPostIds.has(post.id)
          );
          if (hasUnseenPosts) {
            setNewPostsAvailableLocal(true);
          }
        }
      }
    }, currentUser);

    return () => {
      unsubscribe();
    };
  }, [
    memoizedPostListLength,
    dispatch,
    loadPostList,
    isInitialLoad,
    seenPostIds,
    userId,
    fetchInitialPosts,
  ]);

  const handleLoadMorePosts = useCallback(async () => {
    if (!lastPostTimestamp) return;

    setIsLoadingMorePosts(true);
    try {
      const newPosts = await getNewsfeedPosts(lastPostTimestamp);
      if (newPosts.length === 0) {
        setHasMorePosts(false);
        setIsPostFinished(true);
      } else {
        loadPostList([
          ...state.publicPosts,
          ...newPosts.filter((post) => !seenPostIds.has(post.id)),
        ]);
        setLastPostTimestamp(newPosts[newPosts.length - 1].postTime);
        setSeenPostIds(
          new Set([...seenPostIds, ...newPosts.map((post) => post.id)])
        );

        if (newPosts.length < PAGE_SIZE) {
          setHasMorePosts(false);
          setIsPostFinished(true);
        }
      }
    } catch (error) {
      console.error("Failed to load more posts", error);
      notify("Failed to load more posts", "error");
    } finally {
      setIsLoadingMorePosts(false);
    }
  }, [lastPostTimestamp, state.publicPosts, seenPostIds, loadPostList]);

  useEffect(() => {
    const scrollContainer = containerRef.current || window;

    const handleScroll = () => {
      const scrollTop = scrollContainer.scrollTop || window.scrollY;
      const scrollHeight =
        scrollContainer.scrollHeight || document.documentElement.scrollHeight;
      const clientHeight = scrollContainer.clientHeight || window.innerHeight;

      if (scrollTop + clientHeight >= scrollHeight - 5 && hasMorePosts) {
        handleLoadMorePosts();
      }
    };

    const throttledHandleScroll = () => {
      requestAnimationFrame(handleScroll);
    };

    scrollContainer.addEventListener("scroll", throttledHandleScroll);

    return () => {
      scrollContainer.removeEventListener("scroll", throttledHandleScroll);
    };
  }, [state.publicPosts, hasMorePosts, lastPostTimestamp, handleLoadMorePosts]);

  const handleScrollToTop = () => {
    setLastPostTimestamp(null);
    containerRef.current.scrollTo({ top: 0, behavior: "smooth" });
    setNewPostsAvailableLocal(false);
    fetchInitialPosts();
    setHasMorePosts(true);
  };

  return (
    <Grid item xs={12} md={10} component="main" sx={{ height: "100%" }}>
      <Box
        sx={{
          p: 3,
          // maxWidth: "65rem",
          width: "100%",
          marginLeft: "auto",
          marginRight: "auto",
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          transition: "margin-left 0.3s ease",
          overflow: "scroll",
        }}
        ref={containerRef}
      >
        <Toolbar sx={{ minHeight: "52px !important" }} />
        {newPostsAvailable && (
          <Button
            variant="contained"
            color="primary"
            onClick={handleScrollToTop}
            sx={{
              position: "fixed",
              top: 80,
              zIndex: 1000,
              left: "50%",
            }}
            startIcon={<ArrowUpwardRounded />}
          >
            New Posts
          </Button>
        )}
        {state.publicPostLoading ? (
          <PostCardSkeleton />
        ) : (
          <>
            <TimelineFeed
              theme={theme}
              pendingDeletes={pendingDeletes}
              pendingEdits={pendingEdits}
              notify={notify}
              posts={optimisticPosts}
              onPostDelete={handleDeleteClick}
              isLoadingMorePost={isLoadingMorePost}
              isPostFinished={isPostFinished}
              onEditOpen={handleOpenEdit}
              onEditClose={handleCloseEdit}
              onEditConfirm={handleEditConfirm}
              isEditOpen={showEditConfirmation}
              isEditingPost={isEditingPost}
              currentPost={currentPost}
              onOpenAuth={handleOpenDialog}
            />
            <DeleteDialog
              onOpen={showDeleteConfirmation}
              onClose={handleDeleteClose}
              onDelete={handleDeleteConfirm}
              title={""}
            />
            <AuthDialog open={dialogOpen} onClose={handleCloseDialog} />
          </>
        )}
      </Box>
    </Grid>
  );
}

export default Timeline;
