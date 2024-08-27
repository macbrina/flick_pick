"use client";

import { Grid } from "@mui/material";
import PostCard from "@/app/_components/Timeline/PostCard";
import PostCardSkeleton from "@/app/_components/Timeline/PostCardSkeleton";
import NoPostsCard from "@/app/_components/Timeline/NoPostsCard";
import { useMovies } from "@/app/_context/MoviesContext";

const TimelineFeed = ({
  posts,
  onLike,
  onComment,
  onWatchList,
  onMovieHistory,
}) => {
  const { state } = useMovies();

  return (
    <Grid container spacing={2} justifyContent="center" sx={{ height: "100%" }}>
      {posts.map((post) => (
        <Grid item xs={12} sm={12} md={10} key={post.postId}>
          {state.publicPostLoading ? (
            <PostCardSkeleton />
          ) : (
            <PostCard
              user={post.user}
              movie={post.movie}
              onLike={() => onLike(post.postId)}
              onComment={(newComment) => onComment(post.postId, newComment)}
              onWatchList={() => onWatchList(post.postId)}
              onMovieHistory={() => onMovieHistory(post.postId)}
              postId={post.postId}
              postTime={post.postTime}
            />
          )}
        </Grid>
      ))}
      {posts.length == 0 && !state.publicPostLoading && <NoPostsCard />}
    </Grid>
  );
};

export default TimelineFeed;
