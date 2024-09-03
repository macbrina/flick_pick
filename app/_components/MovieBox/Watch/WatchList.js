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
import {
  useCallback,
  useEffect,
  useMemo,
  useOptimistic,
  useState,
} from "react";
import { toast } from "react-toastify";
import Spinner from "@/app/_components/Spinner";
import { useNotification } from "@/app/_context/NotificationContext";

function WatchMoviesList({ watchlist, onDeleteWatched, pendingDeletes }) {
  return (
    <ul className="list">
      {watchlist.map((movie) => (
        <WatchMovie
          movie={movie}
          key={movie.id}
          isPendingDelete={pendingDeletes.get(movie.id)}
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

function WatchList() {
  const { state, removeFromWatchList, loadWatchList, dispatch } = useMovies();
  const notify = useNotification();
  const [pendingDeletes, setPendingDeletes] = useState(new Map());
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

  const handleDeleteWatchList = useCallback(
    async (watchIds) => {
      if (!isLoggedIn) {
        notify("You need to be logged in to delete your watchlist..", "error");
        return;
      }

      setPendingDeletes((prev) => {
        const updated = new Map(prev);
        watchIds.forEach((id) => updated.set(id, true));
        return updated;
      });

      try {
        watchIds.forEach((id) => optimisticDelete(id));

        watchIds.forEach((id) => {
          removeFromWatchList(id);
        });

        await Promise.all(watchIds.map((id) => deleteWatchlistItem(id)));

        watchIds.forEach((id) => {
          setPendingDeletes((prev) => {
            const updated = new Map(prev);
            updated.delete(id);
            return updated;
          });
        });
        setSelectedIds(new Set());
      } catch (error) {
        notify("Error deleting movie:", "error");
        setPendingDeletes((prev) => {
          const updated = new Map(prev);
          watchIds.forEach((id) => updated.delete(id));
          return updated;
        });
      }
    },
    [isLoggedIn, optimisticDelete, removeFromWatchList]
  );

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
                {state.watchlistLoading ? (
                  <Spinner />
                ) : (
                  <>
                    <div className="summary-container">
                      <WatchSummary watchlist={optimisticWatchList} />
                      <div className="list-container">
                        <WatchMoviesList
                          watchlist={optimisticWatchList}
                          pendingDeletes={pendingDeletes}
                          onDeleteWatched={handleDeleteWatchList}
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

export default WatchList;
