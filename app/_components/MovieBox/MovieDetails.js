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
} from "@mui/material";
import { isEmptyObj } from "openai/core";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import ShareModal from "./ShareModal";
import { generateUniqueId, getVideoUrl } from "@/app/_utils/utilities";

function MovieDetails({ selectedId, onCloseMovie }) {
  const { isLoggedIn, userId, user } = useIsUserLoggedIn();
  const { addToHistoryList, state, addToWatchList, addToPostList } =
    useMovies();
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
  }, [credits.length]);

  async function handleAddHistory() {
    if (!isLoggedIn) {
      toast.error("Please log in to add to your watched or watchlist.");
      return;
    }

    const newWatchedMovie = {
      userId: userId,
      movieId: selectedId,
      title,
      release_date,
      poster_path,
      tmdbRating: Number(vote_average),
      runtime: Number(runtime),
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
      movieId: selectedId,
      title,
      release_date,
      poster_path,
      tmdbRating: Number(vote_average),
      runtime: Number(runtime),
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

    let movieVideo;
    let site;
    let keyId;

    try {
      const res = await fetch(`/api/movievideo`, {
        method: "POST",
        "Content-Type": "application/json",
        body: JSON.stringify({ movieId: selectedId }),
      });

      if (!res.ok) {
        toast.error("Failed to fetch movie video.");
        return;
      }
      const data = await res.json();

      movieVideo = getVideoUrl(data?.data?.site, data?.data?.key);
      site = data?.data?.site;
      keyId = data?.data?.key;

      const postData = {
        postId: generateUniqueId(),
        userId,
        username: user.username,
        avatarUrl: user.imageUrl || "",
        movieId: selectedId,
        movieTitle: movie.title,
        movieYear: movie.release_date,
        movieImage: movie.poster_path,
        site,
        keyId,
        movieVideo,
        postContent,
        type: "movie",
        source: "tmdb",
        likesCount: 0,
        commentsCount: 0,
      };

      await addPost(postData);
      addToPostList(postData);
      toast.success("Post shared successfully!");
    } catch (error) {
      toast.error("Error fetching movie details:");
    } finally {
      setIsSharing(false);
    }
  };

  useKey("Escape", onCloseMovie);

  useEffect(
    function () {
      async function getMovieDetails() {
        try {
          const res = await fetch(`/api/search`, {
            method: "POST",
            "Content-Type": "application/json",
            body: JSON.stringify({ movieId: selectedId }),
          });
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
    [selectedId]
  );

  useEffect(() => {
    if (selectedId && !isEmptyObj(movie)) {
      async function getMovieSentiment() {
        try {
          const res = await fetch(`/api/analysis`, {
            method: "POST",
            "Content-Type": "application/json",
            body: JSON.stringify({ movieId: selectedId }),
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
  }, [selectedId, movie]);

  useEffect(
    function () {
      if (!title) return;
      document.title = `Movie | ${title}`;

      return function () {
        document.title = "FlickPick";
      };
    },
    [title]
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
              <Typography variant="h5" sx={{ color: "#94a6b8" }}>
                {title}
              </Typography>
              <Typography variant="body1">
                {release_date} &bull; {runtime} min
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
                      sx={{
                        color:
                          sentimentAnalysis.overallSentimentType == "Positive"
                            ? "#17E9AA"
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
                      onClick={handleAddWatchList}
                      disabled={isAddingList}
                    >
                      {isAddingList ? (
                        <>
                          <CircularProgress size={20} color="inherit" />{" "}
                          Adding...
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
                  onClick={handleOpenModal}
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
              sx={{
                padding: "2rem 2.4rem",
                backgroundColor: "var(--color-background-100)",
                borderRadius: "0.9rem",
              }}
            >
              <div className="rating">
                {!isWatched ? (
                  <>
                    <StarRating
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
                            onClick={handleAddHistory}
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
                    You rated with movie {watchedUserRating} ⭐️
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
              {directors.map((director, index) => (
                <Typography variant="body1" key={index}>
                  {director.name},
                </Typography>
              ))}{" "}
            </Stack>
          </section>
        </>
      )}
    </div>
  );
}

export default MovieDetails;
