"use client";

import { useMovies } from "@/app/_context/MoviesContext";
import { addPost } from "@/app/_lib/data-service";
import { useIsUserLoggedIn } from "@/app/_utils/auth";
import { LANGUAGEMAPPING } from "@/app/_utils/constants";
import {
  generateUniqueId,
  GENREIDSTONAME,
  getVideoUrl,
  isEmptyObject,
} from "@/app/_utils/utilities";
import { Close } from "@mui/icons-material";
import {
  Box,
  Button,
  CircularProgress,
  Grid,
  IconButton,
  Skeleton,
  TextField,
  Typography,
} from "@mui/material";
import Image from "next/image";
import { useSnackbar } from "notistack";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import SnackbarNotification from "../SnackbarNotification";
import { useNotification } from "@/app/_context/NotificationContext";

function MovieList({ movies, onSelectMovie, isSharing }) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie
          movie={movie}
          key={movie.id}
          onSelectMovie={onSelectMovie}
          isSharing={isSharing}
        />
      ))}
    </ul>
  );
}

function Movie({ movie, onSelectMovie, isSharing }) {
  return (
    <li style={{ cursor: "default" }}>
      <img
        src={
          !movie.poster_path
            ? "/images/placeholder.png"
            : `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        }
        alt={`${movie.title || movie.name} poster`}
      />
      <Typography variant="h5">{movie.title || movie.name}</Typography>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="body1">
          <Typography variant="body3">🗓</Typography>
          <Typography variant="body3">
            {movie.release_date || movie.first_air_date}
          </Typography>
        </Typography>
        <Button
          variant="contained"
          className="btn-add"
          disabled={isSharing}
          onClick={() => onSelectMovie(movie, movie.movieType)}
        >
          {isSharing ? (
            <>
              <CircularProgress size={20} color="inherit" />{" "}
              <Typography variant="body1">Posting...</Typography>
            </>
          ) : (
            "🚀 Share to Feed"
          )}
        </Button>
      </Box>
    </li>
  );
}

export default function PostMovieBox({ error, searchList, onClose }) {
  const [isOpen, setIsOpen] = useState(true);
  const [isSharing, setIsSharing] = useState(false);
  const [pineconeData, setPinecondata] = useState({});
  const [uploadData, setUploadData] = useState(false);
  const { isLoggedIn, userId, user } = useIsUserLoggedIn();
  const [postContent, setPostContent] = useState("");
  const { dispatch, state } = useMovies();
  const [movie, setMovie] = useState({});
  const [movieType, setMovieType] = useState("");
  const [imageLoading, setImageLoading] = useState(true);
  const [isLoadingRuntime, setIsLoadingRuntime] = useState(false);
  const { notify } = useNotification();

  const handleSharePost = async () => {
    if (!isLoggedIn) {
      notify("You need to be logged in to share.", "error");
      return;
    }

    if (postContent.trim() == "") {
      notify("Please enter a message to share.", "error");
      return;
    }

    setIsSharing(true);
    onClose();

    notify("Post is being uploaded...", "info");

    let movieVideo;

    try {
      const res = await fetch(`/api/movievideo`, {
        method: "POST",
        "Content-Type": "application/json",
        body: JSON.stringify({
          movieId: movie.id,
          type: movieType,
        }),
      });

      if (!res.ok) {
        toast.error("Failed to fetch movie video.");
        return;
      }
      const data = await res.json();

      movieVideo = getVideoUrl(data.data?.videoSite, data.data?.videoKey) || "";

      const postData = {
        postId: generateUniqueId(),
        userId,
        username: user.username,
        avatarUrl: user.imageUrl || "",
        movieId: movie.id,
        language: LANGUAGEMAPPING[movie.original_language] || "Unknown",
        genres: movie.genre_ids.map((id) => GENREIDSTONAME(id)),
        description: movie.overview || "",
        rating: movie.vote_average || 0,
        movieTitle: movie.title || movie.name,
        movieYear: movie.release_date || movie.first_air_date || "",
        movieImage: movie.poster_path,
        ...data.data,
        postContent,
        movieVideo,
        movieType: movieType,
        type: movieType,
        source: "tmdb",
        runtime: movie.runtime || movie.last_episode_to_air?.runtime || 0,
        likesCount: 0,
        commentsCount: 0,
        watchListCount: 0,
        historyCount: 0,
      };

      const pineconeData = {
        id: String(movie.id),
        title: movie.title || movie.name,
        image: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
        rating: movie.vote_average,
        genres: movie.genre_ids.map((id) => GENREIDSTONAME(id)),
        description: movie.overview,
        keywords: [
          movie.title || movie.name,
          ...movie.genre_ids.map((id) => GENREIDSTONAME(id)),
        ],
        language: LANGUAGEMAPPING[movie.original_language] || "Unknown",
        movieType: movieType,
        type: movieType,
        source: "tmdb",
        ...data.data,
        postContent,
      };

      // setPinecondata(pineconeData);
      // setUploadData(true);
      await addPost(postData);
      notify("Post shared successfully!", "success");

      handleClose();
    } catch (error) {
      console.log("error: " + error.message);
      notify("Failed to share post. Please try again...", "error");
    } finally {
      setIsSharing(false);
    }
  };

  useEffect(
    function () {
      async function getMovieRuntime() {
        setIsLoadingRuntime(true);
        try {
          const res = await fetch(`/api/movie-runtime`, {
            method: "POST",
            "Content-Type": "application/json",
            body: JSON.stringify({ movieId: movie.id, type: movieType }),
          });

          if (!res.ok) {
            throw new Error("Failed to fetch movie runtime.");
          }

          const data = await res.json();
          const runtime = data.data.runtime;
          setMovie((prevMovie) => ({
            ...prevMovie,
            runtime,
          }));
        } catch (error) {
          toast.error("Error fetching movie runtime:");
        } finally {
          setIsLoadingRuntime(false);
        }
      }
      if (!isEmptyObject(movie) && movie?.id) {
        getMovieRuntime();
      }
    },
    [movie.id, movieType]
  );

  const handleShare = (movie, movieType) => {
    dispatch({ type: "SET_POST_SELECTED_ID", payload: movie.id });
    setMovie(movie);
    setMovieType(movieType);
  };

  const handleClose = () => {
    dispatch({ type: "SET_POST_SELECTED_ID", payload: null });
    setMovie({});
    setMovieType("");
    setPostContent("");
  };

  useEffect(() => {
    const uploadPineData = async () => {
      try {
        await fetch(`/api/postupload`, {
          method: "POST",
          "Content-Type": "application/json",
          body: JSON.stringify({ pineconeData }),
        });
      } catch (error) {
      } finally {
        setPinecondata({});
        setUploadData(false);
      }
    };
    if (uploadData && !isEmptyObject(pineconeData)) {
      uploadPineData();
    }
  }, [uploadData, pineconeData]);

  return (
    <>
      {(!state.postSelectedId || isEmptyObject(movie)) && (
        <Grid item xs={12}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              borderRadius: "4px",
              height: "100%",
              overflow: "hidden",
            }}
          >
            <Box
              className="box"
              sx={{
                display: "flex",
                flexDirection: "column",
                height: "300px",
                overflow: "auto",
              }}
            >
              <button
                className="btn-toggle"
                onClick={() => setIsOpen((open) => !open)}
              >
                {isOpen ? "–" : "+"}
              </button>

              {isOpen && (
                <>
                  {state.postSearchLoading && (
                    <CircularProgress
                      size="40px"
                      sx={{ margin: "3.2rem auto 1.6rem" }}
                    />
                  )}
                  {!state.postSearchLoading && !error && (
                    <MovieList
                      isSharing={isSharing}
                      movies={searchList}
                      onSelectMovie={(movie, movieType) =>
                        handleShare(movie, movieType)
                      }
                    />
                  )}
                  <Box
                    display="flex"
                    justifyContent="center"
                    flexDirection="column"
                    alignItems="center"
                    sx={{
                      width: "100%",
                      height: "100%",
                      textAlign: "center",
                      padding: "16px",
                    }}
                  >
                    {error && (
                      <Typography
                        variant="h5"
                        sx={{ pb: 4, textAlign: "center" }}
                      >
                        <span>⛔️</span> {error}
                      </Typography>
                    )}
                  </Box>
                </>
              )}
            </Box>
          </Box>
        </Grid>
      )}
      {state.postSelectedId && !isEmptyObject(movie) && (
        <>
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
              {isLoadingRuntime ? (
                <Box display="flex" justifyContent="center" alignItems="center">
                  {" "}
                  <CircularProgress
                    size="40px"
                    sx={{ margin: "3.2rem auto 1.6rem" }}
                  />
                </Box>
              ) : (
                <>
                  <Grid item xs={12}>
                    <TextField
                      label="Your Post"
                      fullWidth
                      multiline
                      value={postContent}
                      onChange={(e) => setPostContent(e.target.value)}
                      variant="outlined"
                      sx={{ marginBottom: "15px" }}
                      disabled={isLoadingRuntime}
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
                      alt={movie.title || movie.name}
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
                </>
              )}
            </Box>
          </Grid>

          {!isLoadingRuntime && (
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
              <Button
                variant="outlined"
                sx={{ mr: 2 }}
                disabled={isSharing}
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleSharePost}
                disabled={isSharing || postContent.trim() == ""}
              >
                {isSharing ? (
                  <>
                    <CircularProgress size={20} color="inherit" />{" "}
                    <Typography variant="body1">Posting...</Typography>
                  </>
                ) : (
                  "Share"
                )}
              </Button>
            </Box>
          )}
        </>
      )}
    </>
  );
}
