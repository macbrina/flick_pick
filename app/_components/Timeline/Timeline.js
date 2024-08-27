"use client";

import React, { useEffect, useMemo, useState } from "react";
import TimelineFeed from "@/app/_components/Timeline/TimelineFeed";
import { useMovies } from "@/app/_context/MoviesContext";
import { Box, CssBaseline, Toolbar } from "@mui/material";
import Header from "@/app/_components/Header";
import Sidebar from "@/app/_components/Sidebar";
import { useIsUserLoggedIn } from "@/app/_utils/auth";
import { toast } from "react-toastify";
import { addComment, getNewsfeedPosts } from "@/app/_lib/data-service";

function Timeline() {
  const { state, loadPostList, dispatch, addToComments, increasePostComments } =
    useMovies();
  const { isLoggedIn, userId, user } = useIsUserLoggedIn();

  const memoizedPostListLength = useMemo(
    () => state.publicPosts.length,
    [state.publicPosts]
  );

  const handleLike = (postId) => {
    if (!isLoggedIn) {
      toast.error("You need to be logged in to like a post.");
      return;
    }
    console.log(`Liked post ${postId}`);
    // Update likesCount logic here
  };

  const handleComment = async (postId, newComment) => {
    if (!isLoggedIn) {
      toast.error("You need to be logged in to comment.");
      return;
    }

    const commentData = {
      postId,
      userId,
      text: newComment,
      username: user.username,
      avatarUrl: user.imageUrl,
    };

    try {
      await addComment(commentData);
      increasePostComments(postId, "add");
    } catch (error) {
      throw error;
    }
  };

  const handleWatchList = (postId) => {
    if (!isLoggedIn) {
      toast.error("You need to be logged in to add to your watchlist.");
      return;
    }

    console.log(`Bookmarked post ${postId}`);
    // Update bookmark logic here
  };

  const handleMovieHistory = (postid) => {
    if (!isLoggedIn) {
      toast.error("You need to be logged in to add to your history.");
      return;
    }
    console.log(`Added movie to history ${postId}`);
    // Update history logic here
  };

  // console.log("loading", state.publicPostLoading);

  useEffect(() => {
    if (memoizedPostListLength > 0) {
      return;
    }

    async function fetchAllPosts() {
      try {
        dispatch({ type: "SET_POSTS_LOADING", payload: true });
        const allPosts = await getNewsfeedPosts();
        loadPostList(allPosts);
      } catch (error) {
        console.error(error);
        toast.error("Failed to fetch watchlist");
      } finally {
        dispatch({ type: "SET_POSTS_LOADING", payload: false });
      }
    }

    fetchAllPosts();
  }, [memoizedPostListLength, dispatch, loadPostList]);

  // console.log("posts", state.publicPosts);

  return (
    <Box
      sx={{
        display: state.drawerOpen ? "flex" : "block",
        transition: "width 0.3s ease",
        height: "100vh",
      }}
    >
      <CssBaseline />
      <Header />
      <Sidebar />

      <Box
        component="main"
        sx={{
          p: 3,
          maxWidth: "65rem",
          width: "100%",
          marginLeft: "auto",
          marginRight: "auto",
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          transition: "margin-left 0.3s ease",
        }}
      >
        <Toolbar />
        <TimelineFeed
          posts={state.publicPosts}
          onLike={handleLike}
          onComment={handleComment}
          onWatchList={handleWatchList}
          onMovieHistory={handleMovieHistory}
        />
      </Box>
    </Box>
  );
}

export default Timeline;
