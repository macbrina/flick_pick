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
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>

      {isOpen && children}
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
          //   overflow: "hidden",
          transition: "margin-left 0.3s ease",
        }}
      >
        <Toolbar />

        <Grid
          container
          spacing={3}
          sx={{
            marginTop: "2.4rem",
            flexGrow: 1,
            height: "calc(100vh - 7.2rem - 3* 2.4rem)",
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
                    <WatchedSummary watched={optimisticHistoryList} />
                    <WatchedMoviesList
                      watched={optimisticHistoryList}
                      onDeleteWatched={handleDeleteWatched}
                    />
                  </>
                )}
              </MovieBox>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

export default MovieHistory;
