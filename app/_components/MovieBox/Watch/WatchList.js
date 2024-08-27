"use client";

import Header from "@/app/_components/Header";
import WatchMovie from "@/app/_components/MovieBox/Watch/WatchMovie";
import WatchSummary from "@/app/_components/MovieBox/Watch/WatchSummary";
import Sidebar from "@/app/_components/Sidebar";
import { useMovies } from "@/app/_context/MoviesContext";
import { useLocalStorageState } from "@/app/_hooks/useLocalStorageState";
import {
  deleteWatchlistItem,
  fetchUserWatchlist,
} from "@/app/_lib/data-service";
import { useIsUserLoggedIn } from "@/app/_utils/auth";
import { Box, CssBaseline, Grid, Toolbar } from "@mui/material";
import { useEffect, useMemo, useOptimistic, useState } from "react";
import { toast } from "react-toastify";
import Spinner from "@/app/_components/Spinner";

function WatchMoviesList({ watchlist, onDeleteWatched }) {
  return (
    <ul className="list">
      {watchlist.map((movie) => (
        <WatchMovie
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

function WatchList() {
  const { state, removeFromWatchList, loadWatchList, dispatch } = useMovies();

  const memoizedWatchListLength = useMemo(
    () => state.watchList.length,
    [state.watchList]
  );
  const { isLoggedIn, userId } = useIsUserLoggedIn();

  const [optimisticWatchList, optimisticDelete] = useOptimistic(
    state.watchList,
    (curCollections, collectionId) =>
      curCollections.filter((collection) => collection.id !== collectionId)
  );

  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }

    if (memoizedWatchListLength > 0) {
      return;
    }

    async function fetchMovieHistory() {
      try {
        dispatch({ type: "SET_WATCHLIST_LOADING", payload: true });
        const watchlist = await fetchUserWatchlist(userId);
        loadWatchList(watchlist);
      } catch (error) {
        console.error(error);
        toast.error("Failed to fetch watchlist");
      } finally {
        dispatch({ type: "SET_WATCHLIST_LOADING", payload: false });
      }
    }

    fetchMovieHistory();
  }, [isLoggedIn, memoizedWatchListLength, dispatch, loadWatchList, userId]);

  async function handleDeleteWatchList(id) {
    try {
      optimisticDelete(id);
      await deleteWatchlistItem(id);

      toast.success("Movie successfully deleted from watchlist.");
      removeFromWatchList(id);
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
                {state.watchlistLoading ? (
                  <Spinner />
                ) : (
                  <>
                    <WatchSummary watchlist={optimisticWatchList} />
                    <WatchMoviesList
                      watchlist={optimisticWatchList}
                      onDeleteWatched={handleDeleteWatchList}
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

export default WatchList;
