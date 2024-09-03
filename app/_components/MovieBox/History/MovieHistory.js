"use client";

import Header from "@/app/_components/Header";
import WatchedMovie from "@/app/_components/MovieBox/History/WatchedMovie";
import WatchedSummary from "@/app/_components/MovieBox/History/WatchedSummary";
import Sidebar from "@/app/_components/Sidebar";
import { useMovies } from "@/app/_context/MoviesContext";
import { useLocalStorageState } from "@/app/_hooks/useLocalStorageState";
import {
  deleteMovieHistoryItem,
  fetchUserMovieHistory,
} from "@/app/_lib/data-service";
import { useIsUserLoggedIn } from "@/app/_utils/auth";
import { Box, CssBaseline, Grid, Toolbar } from "@mui/material";
import { useEffect, useMemo, useOptimistic, useState } from "react";
import { toast } from "react-toastify";
import Spinner from "@/app/_components/Spinner";

function WatchedMoviesList({ watched, onDeleteWatched }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie
          movie={movie}
          key={movie.id}
          onDeleteWatched={onDeleteWatched}
        />
      ))}
    </ul>
  );
}

function MovieBox({ children }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="box" style={{ height: "calc(100vh - 0.2rem - 3* 2.4rem)" }}>
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>

      {isOpen && <div className="summary-container">{children}</div>}
    </div>
  );
}

function MovieHistory() {
  const { state, loadHistoryList, dispatch, removeFromHistoryList } =
    useMovies();
  const memoizedHistoryListLength = useMemo(
    () => state.historyList.length,
    [state.historyList]
  );
  const { isLoggedIn, userId } = useIsUserLoggedIn();

  const [optimisticHistoryList, optimisticDelete] = useOptimistic(
    state.historyList,
    (curCollections, collectionId) =>
      curCollections.filter((collection) => collection.id !== collectionId)
  );

  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }

    if (memoizedHistoryListLength > 0) {
      return;
    }

    async function fetchMovieHistory() {
      try {
        dispatch({ type: "SET_HISTORY_LOADING", payload: true });
        const history = await fetchUserMovieHistory(userId);
        loadHistoryList(history);
      } catch (error) {
        console.error(error);
        toast.error("Failed to fetch movie history");
      } finally {
        dispatch({ type: "SET_HISTORY_LOADING", payload: false });
      }
    }

    fetchMovieHistory();
  }, [
    isLoggedIn,
    memoizedHistoryListLength,
    dispatch,
    loadHistoryList,
    userId,
  ]);

  async function handleDeleteWatched(id) {
    try {
      optimisticDelete(id);
      await deleteMovieHistoryItem(id);
      toast.success("Movie successfully deleted from history.");
      removeFromHistoryList(id);
    } catch (error) {
      toast.error("Error deleting movie:", error);
    }
  }

  return (
    <Grid item xs={12} md={10} component="main" sx={{ p: 2, height: "100%" }}>
      <Box
        sx={{
          p: 3,
          maxWidth: "65rem",
          width: "100%",
          marginLeft: "auto",
          marginRight: "auto",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          //   overflow: "hidden",
          transition: "margin-left 0.3s ease",
        }}
      >
        <Toolbar sx={{ minHeight: "20px !important" }} />
        <Grid
          container
          spacing={2}
          sx={{
            marginTop: 2,
            flexGrow: 1,
            height: "calc(100vh - 0.2rem - 3* 2.4rem)",
          }}
        >
          <Grid item xs={12}>
            <Box
              sx={{
                // height: "calc(100vh - 7.2rem - 3* 2.4rem)",
                display: "flex",
                flexDirection: "column",
                borderRadius: "4px",
              }}
            >
              <MovieBox>
                {state.historyLoading ? (
                  <Spinner />
                ) : (
                  <>
                    <div className="summary-container">
                      <WatchedSummary watched={optimisticHistoryList} />
                      <div className="list-container">
                        <WatchedMoviesList
                          watched={optimisticHistoryList}
                          onDeleteWatched={handleDeleteWatched}
                        />
                      </div>
                    </div>
                  </>
                )}
              </MovieBox>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Grid>
  );
}

export default MovieHistory;
