"use client";
import Spinner from "@/app/_components/Spinner";
import StarRating from "@/app/_components/StarRating";
import { useMovies } from "@/app/_context/MoviesContext";
import { useKey } from "@/app/_hooks/useKey";
import {
  addPost,
  addToMovieHistory,
  addToWatchlist,
  fetchUserMovieHistory,
  fetchUserWatchlist,
} from "@/app/_lib/data-service";
import { useIsUserLoggedIn } from "@/app/_utils/auth";
import { useUser } from "@clerk/nextjs";
import {
  Box,
  Button,
  CircularProgress,
  Skeleton,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { isEmptyObj } from "openai/core";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import ShareModal from "./ShareModal";
import {
  generateUniqueId,
  GENREIDSTONAME,
  getVideoUrl,
} from "@/app/_utils/utilities";
import { LANGUAGEMAPPING } from "@/app/_utils/constants";
import { useNotification } from "@/app/_context/NotificationContext";
import AuthDialog from "../Auth/AuthDialog";

function MovieDetails({ selectedId, onCloseMovie }) {
  const theme = useTheme();
  const { isLoggedIn, userId, user } = useIsUserLoggedIn();
  const { addToHistoryList, state, addToWatchList, addNewPost } = useMovies();
  const { notify } = useNotification();
  const [movie, setMovie] = useState({});
  const [credits, setCredits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userRating, setUserRating] = useState("");
  const [actors, setActors] = useState([]);
  const [directors, setDirectors] = useState([]);
  const [sentimentAnalysis, setSentimentAnalysis] = useState({});
  const [loadingSentiment, setLoadingSentiment] = useState(true);
  const [message, setMessage] = useState("");
  const countRef = useRef(0);
  const [isAddingList, setIsAddingList] = useState(false);
  const [isAddingHistory, setIsAddingHistory] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [pineconeData, setPinecondata] = useState({});
  const [uploadData, setUploadData] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleOpenDialog = () => {
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  useEffect(
    function () {
      if (userRating) countRef.current++;
    },
    [userRating]
  );

  const isWatched = state.historyList
    .map((movie) => movie.movieId)
    .includes(selectedId);
  const watchedUserRating = state.historyList.find(
    (movie) => movie.movieId === selectedId
  )?.userRating;

  const isWatchList = state.watchList
    .map((movie) => movie.movieId)
    .includes(selectedId);

  const {
    title,
    release_date,
    last_episode_to_air,
    name,
    first_air_date,
    poster_path,
    runtime,
    vote_average,
    overview,
    genres,
  } = movie;

  const getUniqueCrew = (crew) => {
    const seenIds = new Set();
    return crew.filter((member) => {
      if (seenIds.has(member.id)) {
        return false;
      }
      seenIds.add(member.id);
      return true;
    });
  };

  useEffect(() => {
    if (credits.length != 0 && credits.cast.length != 0) {
      setActors(credits.cast.slice(0, 5));
    }
  }, [credits.length, credits.cast]);

  useEffect(() => {
    if (credits.length != 0 && credits.crew.length != 0) {
      const uniqueCrew = getUniqueCrew(credits.crew);
      const slicedDirectors = uniqueCrew
        .filter((member) => member.department === "Directing")
        .slice(0, 5);
      setDirectors(slicedDirectors);
    }
  }, [credits.length, credits.crew]);

  async function handleAddHistory() {
    if (!isLoggedIn) {
      toast.error("Please log in to add to your watched or watchlist.");
      return;
    }

    const newWatchedMovie = {
      userId: userId,
      postId: null,
      movieId: selectedId,
      movieType: state.selectedMovieType,
      title: title || name,
      release_date: release_date || first_air_date,
      poster_path,
      tmdbRating: Number(vote_average),
      runtime: Number(runtime || last_episode_to_air?.runtime),
      userRating,
      countRatingDecisions: countRef.current,
    };
    setIsAddingHistory(true);

    try {
      const movieHistory = await addToMovieHistory(newWatchedMovie);
      addToHistoryList(movieHistory);
      toast.success("Movie successfully added to history");
    } catch (error) {
      console.error("Error adding movie to history:", error);
      toast.error("Failed to add movie to your watched list.");
    } finally {
      setIsAddingHistory(false);
    }
  }

  async function handleAddWatchList() {
    if (!isLoggedIn) {
      toast.error("Please log in to add to your watched or watchlist.");
      return;
    }

    const newWatchedMovie = {
      userId: userId,
      postId: null,
      movieId: selectedId,
      movieType: state.selectedMovieType,
      title: title || name,
      release_date: release_date || first_air_date,
      poster_path,
      tmdbRating: Number(vote_average),
      runtime: Number(runtime || last_episode_to_air?.runtime),
    };

    setIsAddingList(true);

    try {
      const addedMovie = await addToWatchlist(newWatchedMovie);
      addToWatchList(addedMovie);
      toast.success("Movie successfully added to watchlist");
    } catch (error) {
      console.error("Error adding movie to watchlist:", error);
      toast.error("Failed to add movie to your watchlist.");
    } finally {
      setIsAddingList(false);
    }
  }

  const handleOpenModal = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleShare = async (postContent) => {
    if (!isLoggedIn) {
      toast.error("You need to be logged in to share.");
      return;
    }

    if (postContent.trim() == "") {
      toast.error("Please enter a message to share.");
      return;
    }

    setIsSharing(true);
    handleCloseModal();

    notify("Post is being uploaded...", "info");

    let movieVideo;

    try {
      const res = await fetch(`/api/movievideo`, {
        method: "POST",
        "Content-Type": "application/json",
        body: JSON.stringify({
          movieId: selectedId,
          type: state.selectedMovieType,
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
        movieId: selectedId,
        language: LANGUAGEMAPPING[movie.original_language] || "Unknown",
        genres: movie.genres.map((genre) => GENREIDSTONAME(genre.id)),
        description: movie.overview || "",
        rating: movie.vote_average || 0,
        movieTitle: movie.title || movie.name,
        movieYear: movie.release_date || movie.first_air_date || "",
        movieImage: movie.poster_path,
        ...data.data,
        postContent,
        movieVideo,
        movieType: state.selectedMovieType,
        type: state.selectedMovieType,
        source: "tmdb",
        runtime: movie?.runtime || movie.last_episode_to_air?.runtime || 0,
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
        genres: movie.genres.map((genre) => GENREIDSTONAME(genre.id)),
        description: movie.overview,
        keywords: [
          movie.title || movie.name,
          ...movie.genres.map((genre) => GENREIDSTONAME(genre.id)),
        ],
        language: LANGUAGEMAPPING[movie.original_language] || "Unknown",
        movieType: state.selectedMovieType,
        type: state.selectedMovieType,
        source: "tmdb",
        ...data.data,
        postContent,
      };

      // setPinecondata(pineconeData);
      // setUploadData(true);
      await addPost(postData);
      addNewPost(postData);
      notify("Post shared successfully!", "success");
    } catch (error) {
      toast.error("Error fetching movie details:");
    } finally {
      setIsSharing(false);
    }
  };

  function resetState() {
    setActors([]);
    setDirectors([]);
    setMovie({});
    setCredits({});
    setModalOpen(false);
    setPinecondata({});
    setUploadData(false);
  }

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
    if (uploadData && !isEmptyObj(pineconeData)) {
      uploadPineData();
    }
  }, [uploadData, pineconeData]);

  useKey("Escape", onCloseMovie);

  useEffect(
    function () {
      async function getMovieDetails() {
        try {
          const res = await fetch(`/api/search`, {
            method: "POST",
            "Content-Type": "application/json",
            body: JSON.stringify({
              movieId: selectedId,
              type: state.selectedMovieType,
            }),
          });

          if (!res.ok) {
            throw new Error("Failed to fetch movie details.");
          }
          const data = await res.json();
          setMovie(data.data.movieData);
          setCredits(data.data.creditsData);
        } catch (error) {
          toast.error("Error fetching movie details:");
        } finally {
          setIsLoading(false);
        }
      }
      getMovieDetails();
    },
    [selectedId, state.selectedMovieType]
  );

  useEffect(() => {
    if (selectedId && !isEmptyObj(movie)) {
      async function getMovieSentiment() {
        try {
          const res = await fetch(`/api/analysis`, {
            method: "POST",
            "Content-Type": "application/json",
            body: JSON.stringify({
              movieId: selectedId,
              type: state.selectedMovieType,
            }),
          });
          const data = await res.json();
          if (data.success) {
            setSentimentAnalysis(data.data);
          } else {
            setMessage(data.message);
          }
        } catch (error) {
          toast.error("Error fetching sentiment details:");
        } finally {
          setLoadingSentiment(false);
        }
      }
      getMovieSentiment();
    }
  }, [selectedId, movie, state.selectedMovieType]);

  useEffect(
    function () {
      if (!title) return;
      document.title = `Movie | ${title || name}`;

      return function () {
        document.title = "FlickPick";
      };
    },
    [title, name]
  );

  return (
    <div className="details">
      {isLoading ? (
        <Spinner />
      ) : (
        <>
          <header>
            <button className="btn-back" onClick={onCloseMovie}>
              &larr;
            </button>
            <img
              src={
                !poster_path
                  ? "/images/placeholder.png"
                  : `https://image.tmdb.org/t/p/w500${movie.poster_path}`
              }
              style={{ objectFit: !poster_path ? "cover" : "contain" }}
              alt={`Poster of ${movie} movie`}
            />
            <div className="details-overview">
              <Typography variant="h5">{title || name}</Typography>
              <Typography variant="body1">
                {release_date || first_air_date} &bull;{" "}
                {runtime || last_episode_to_air?.runtime || 0} min
              </Typography>
              <Stack
                spacing={1}
                direction={{ xs: "column", sm: "row", md: "row", lg: "row" }}
              >
                {genres.map((genre) => (
                  <Typography variant="body1" key={genre.id}>
                    {genre.name}
                  </Typography>
                ))}{" "}
              </Stack>
              <Stack direction="row" spacing={2}>
                <Typography variant="body1">
                  <Typography variant="body3">⭐️</Typography>
                  {vote_average.toFixed(1)} TMDb rating
                </Typography>
                <Typography variant="body1">
                  <Typography variant="body3">📈</Typography>
                  SA Score:
                  {!isEmptyObj(sentimentAnalysis) && (
                    <Typography
                      variant="body3"
                      fontWeight="bold"
                      sx={{
                        color:
                          sentimentAnalysis.overallSentimentType == "Positive"
                            ? theme.palette.mode == "dark"
                              ? "#17E9AA"
                              : "#0C7153"
                            : sentimentAnalysis.overallSentimentType ==
                              "Negative"
                            ? "#F83A3A"
                            : "",
                      }}
                    >
                      {sentimentAnalysis?.overallSentimentScore?.toFixed(1)}{" "}
                      {sentimentAnalysis.overallSentimentType}
                    </Typography>
                  )}
                  {isEmptyObj(sentimentAnalysis) && loadingSentiment && (
                    <Skeleton
                      variant="rectangular"
                      animation="wave"
                      width={100}
                      height={20}
                    />
                  )}
                  {isEmptyObj(sentimentAnalysis) && !loadingSentiment && (
                    <Typography variant="body3">{message}</Typography>
                  )}
                </Typography>
              </Stack>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row", md: "row" },
                  alignItems: "center",
                  gap: 3,
                }}
              >
                {!isWatchList ? (
                  <>
                    <Button
                      variant="contained"
                      className="btn-add"
                      onClick={() => {
                        if (isLoggedIn) {
                          handleAddWatchList();
                        } else {
                          handleOpenDialog();
                        }
                      }}
                      disabled={isAddingList}
                    >
                      {isAddingList ? (
                        <>
                          <CircularProgress size={20} color="inherit" />
                        </>
                      ) : (
                        "+ Add to Watchlist"
                      )}
                    </Button>
                  </>
                ) : (
                  <Button variant="contained" className="btn-add" disabled>
                    🔖 Added to Watchlist
                  </Button>
                )}
                <Button
                  variant="contained"
                  className="btn-add"
                  onClick={() => {
                    if (isLoggedIn) {
                      handleOpenModal();
                    } else {
                      handleOpenDialog();
                    }
                  }}
                >
                  🚀 Share to Feed
                </Button>
              </Box>
              <ShareModal
                movie={movie}
                open={isModalOpen}
                onClose={handleCloseModal}
                onShare={handleShare}
                isSharing={isSharing}
              />
            </div>
          </header>

          <section>
            <Box
              sx={(theme) => ({
                padding: "2rem 2.4rem",
                backgroundColor:
                  theme.palette.mode == "dark"
                    ? "var(--color-background-100)"
                    : "var(--color-background-white-100)",
                borderRadius: "0.9rem",
              })}
            >
              <div className="rating">
                {!isWatched ? (
                  <>
                    <Typography variant="h6">Rate this movie:</Typography>
                    <StarRating
                      color={
                        theme.palette.mode == "dark" ? "#fcc419" : "#6741D9"
                      }
                      maxRating={10}
                      size={24}
                      onSetRating={setUserRating}
                    />
                    {userRating > 0 && (
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: { xs: "column", md: "row" },
                          alignItems: "center",
                          gap: 3,
                        }}
                      >
                        {!isLoggedIn ? (
                          <Typography variant="body1">
                            You must be logged in to perform this action
                          </Typography>
                        ) : (
                          <Button
                            variant="contained"
                            className="btn-add"
                            onClick={() => {
                              if (isLoggedIn) {
                                handleAddHistory();
                              } else {
                                handleOpenDialog();
                              }
                            }}
                            disabled={isAddingHistory}
                          >
                            {isAddingHistory ? (
                              <>
                                <CircularProgress size={20} color="inherit" />{" "}
                                Adding...
                              </>
                            ) : (
                              "+ Add to Movie History"
                            )}
                          </Button>
                        )}
                      </Box>
                    )}
                  </>
                ) : (
                  <Typography variant="body1">
                    You rated with{" "}
                    {state.selectedMovieType == "movie" ? "movie" : "Tv Show"}{" "}
                    {watchedUserRating} ⭐️
                  </Typography>
                )}
              </div>
            </Box>
            <Typography variant="body1">
              <em>{overview}</em>
            </Typography>

            <Stack
              spacing={1}
              direction={{ xs: "column", sm: "column", md: "row", lg: "row" }}
            >
              <Typography variant="body1" fontWeight="bold">
                Casts:{" "}
              </Typography>
              {actors.map((actor, index) => (
                <Typography variant="body1" key={index}>
                  {actor.name},
                </Typography>
              ))}{" "}
            </Stack>

            <Stack
              spacing={1}
              direction={{ xs: "column", sm: "column", md: "row", lg: "row" }}
            >
              <Typography variant="body1" fontWeight="bold">
                Directed by:
              </Typography>
              {directors.length > 0
                ? directors.map((director, index) => (
                    <Typography variant="body1" key={index}>
                      {director.name},
                    </Typography>
                  ))
                : "N/A"}
            </Stack>
          </section>

          <AuthDialog open={dialogOpen} onClose={handleCloseDialog} />
        </>
      )}
    </div>
  );
}

export default MovieDetails;
