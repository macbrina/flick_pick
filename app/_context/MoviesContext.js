"use client";

import { movieReducer } from "@/app/_context/reducer";
import { auth } from "@/app/_firebase/config";
import {
  checkAndAddUserToFirestore,
  getUserPartialData,
} from "@/app/_lib/data-service";
import {
  generateUniqueId,
  getChatLimitBasedOnPlan,
  getHistoryLimitBasedOnPlan,
  getPostLimitBasedOnPlan,
  getScrapeLimitBasedOnPlan,
  getWatchListLimitBasedOnPlan,
  isEmptyObject,
} from "@/app/_utils/utilities";
import { useAuth, useUser } from "@clerk/nextjs";
import { signInWithCustomToken } from "firebase/auth";
import { usePathname } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
} from "react";
import { toast } from "react-toastify";

const MoviesContext = createContext();

const initialState = {
  themeMode:
    typeof window !== "undefined"
      ? localStorage.getItem("themeMode") || "dark"
      : "light",
  drawerOpen: true,
  pathname: "",
  fbUser: {},
  searchCollections: [],
  searchLoading: false,
  postSearchLoading: false,
  postSelectedId: null,
  selectedId: null,
  selectedMovieType: "",
  searchError: "",
  watchList: [],
  historyList: [],
  comments: [],
  commentsLoading: false,
  watchlistLoading: false,
  historyLoading: false,
  publicPostLoading: true,
  userExist: false,
  fbUserExist: false,
  publicPosts: [],
  formData: {
    movieName: "",
    genre: "28",
    releaseYear: "",
    language: "en",
    type: "movie",
  },
};

function MoviesProvider({ children }) {
  const [state, dispatch] = useReducer(movieReducer, initialState);
  const pathname = usePathname();
  const { getToken, userId } = useAuth();
  const { user, isLoaded } = useUser();

  const toggleThemeMode = () => {
    const newThemeMode = state.themeMode === "dark" ? "light" : "dark";

    dispatch({ type: "TOGGLE_THEME_MODE" });
    localStorage.setItem("themeMode", newThemeMode);
  };

  const toggleDrawer = () => {
    dispatch({ type: "TOGGLE_DRAWER_MODE" });
  };

  const loadWatchList = useCallback(
    (items) => {
      dispatch({ type: "SET_WATCH_LIST", payload: items });
    },
    [dispatch]
  );

  const addToWatchList = useCallback(
    (movie) => {
      dispatch({ type: "ADD_TO_WATCH_LIST", payload: movie });
    },
    [dispatch]
  );

  const removeFromWatchList = useCallback(
    (movie) => {
      dispatch({ type: "REMOVE_FROM_WATCH_LIST", payload: movie });
    },
    [dispatch]
  );

  const loadHistoryList = useCallback(
    (items) => {
      dispatch({ type: "SET_HISTORY_LIST", payload: items });
    },
    [dispatch]
  );

  const addToHistoryList = useCallback(
    (movie) => {
      dispatch({ type: "ADD_TO_HISTORY", payload: movie });
    },
    [dispatch]
  );

  const removeFromHistoryList = useCallback(
    (movie) => {
      dispatch({ type: "REMOVE_FROM_HISTORY", payload: movie });
    },
    [dispatch]
  );

  const loadPostList = useCallback(
    (items, hasMorePosts, lastPostTimestamp) => {
      dispatch({
        type: "SET_POST_LIST",
        payload: {
          posts: items,
          hasMorePosts,
          lastPostTimestamp,
        },
      });
    },
    [dispatch]
  );

  const addNewPost = useCallback(
    (post) => {
      dispatch({ type: "ADD_NEW_POST", payload: post });
    },
    [dispatch]
  );

  const setNewPostsAvailable = useCallback(
    (available) => {
      dispatch({ type: "SET_NEW_POSTS_AVAILABLE", payload: available });
    },
    [dispatch]
  );

  const removeFromPostList = useCallback(
    (postId) => {
      dispatch({ type: "REMOVE_FROM_POST", payload: postId });
    },
    [dispatch]
  );

  const increasePostComments = useCallback(
    (postId, operation) => {
      dispatch({
        type: "UPDATE_POST_COMMENTS",
        payload: {
          postId,
          operation,
        },
      });
    },
    [dispatch]
  );

  const increasePostLikes = useCallback(
    (postId, operation) => {
      dispatch({
        type: "UPDATE_POST_LIKES",
        payload: {
          postId,
          operation,
        },
      });
    },
    [dispatch]
  );

  const increasePostWatchList = useCallback(
    (postId, operation) => {
      dispatch({
        type: "UPDATE_WATCHLIST_ADD",
        payload: {
          postId,
          operation,
        },
      });
    },
    [dispatch]
  );

  const increasePostHistory = useCallback(
    (postId, operation) => {
      dispatch({
        type: "UPDATE_HISTORY_ADD",
        payload: {
          postId,
          operation,
        },
      });
    },
    [dispatch]
  );

  const loadComments = useCallback(
    (items) => {
      dispatch({ type: "SET_COMMENT_LIST", payload: items });
    },
    [dispatch]
  );

  const addToComments = useCallback(
    (commentID) => {
      dispatch({ type: "ADD_TO_COMMENT", payload: commentID });
    },
    [dispatch]
  );

  const removeFromComments = useCallback(
    (commentID) => {
      dispatch({ type: "REMOVE_FROM_COMMENT", payload: commentID });
    },
    [dispatch]
  );

  const handleSelectMovie = useCallback(
    (id, movieType) => {
      const newId = id == state.selectedId ? null : id;
      dispatch({ type: "SET_SELECTED_ID", payload: newId });
      dispatch({ type: "SET_SELECTED_MOVIE_TYPE", payload: movieType });
    },
    [dispatch, state.selectedId]
  );

  const updateSearchList = useCallback(
    (items) => {
      dispatch({ type: "SET_SEARCH_LIST", payload: items });
    },
    [dispatch]
  );

  const updateFormData = useCallback(
    (data) => {
      dispatch({ type: "UPDATE_FORM_DATA", payload: data });
    },
    [dispatch]
  );

  useEffect(() => {
    document.body.classList.toggle("dark", state.themeMode === "dark");

    return () => {
      document.body.classList.remove("dark", "light");
    };
  }, [state.themeMode]);

  useEffect(() => {
    const handlePathnameChange = () => {
      const pathSegment = pathname.split("/")[2];
      dispatch({ type: "SET_PATHNAME", payload: pathSegment });
    };

    handlePathnameChange();

    return () => {
      window.removeEventListener("popstate", handlePathnameChange);
    };
  }, [pathname, dispatch]);

  useEffect(() => {
    const signInToFirebase = async () => {
      if (!userId) return;

      try {
        const token = await getToken({ template: "integration_firebase" });
        if (token) {
          await signInWithCustomToken(auth, token);
          dispatch({ type: "SET_USEREXIST_LOADING", payload: true });
        }
      } catch (error) {
        toast.error("Failed to sign in to Firebase: " + error.message);
      }
    };

    signInToFirebase();
  }, [userId, getToken]);

  useEffect(() => {
    async function addUserToDb() {
      if (user && isLoaded && state.userExist) {
        const userId = user.id;
        const subscriptionId = generateUniqueId();
        const userData = {
          userId: user.id,
          email: user.primaryEmailAddress.emailAddress,
          avatarUrl: user.imageUrl,
          username: user.username,
          subscriptionId: subscriptionId,
          isPremium: false,
          isActive: false,
          role: "user",
          createdAt: new Date(),
        };

        const subscriptionData = {
          userId: user.id,
          status: "active",
          plan: "Free",
          endsAt: null,
          id: subscriptionId,
          price: "0.00",
          stripeCustomerId: "",
          postLimit: getPostLimitBasedOnPlan("Free"),
          chatLimit: getChatLimitBasedOnPlan("Free"),
          watchListLimit: getWatchListLimitBasedOnPlan("Free"),
          historyLimit: getHistoryLimitBasedOnPlan("Free"),
          scrapeLimit: getScrapeLimitBasedOnPlan("Free"),
          createdAt: new Date(),
        };

        try {
          await checkAndAddUserToFirestore(userId, userData, subscriptionData);
          dispatch({ type: "SET_FBUSEREXIST_LOADING", payload: true });
        } catch (error) {
          console.error("Error adding in to Firebase:", error);
        }
      }
    }
    addUserToDb();
  }, [user, isLoaded, dispatch, state.userExist]);

  useEffect(() => {
    async function fetchUser() {
      if (
        user &&
        isLoaded &&
        isEmptyObject(state.fbUser) &&
        state.fbUserExist
      ) {
        try {
          const newUser = await getUserPartialData(user.id);
          dispatch({ type: "SET_FBUSER", payload: newUser });
        } catch (error) {
          toast.error(error.message);
        }
      }
    }
    fetchUser();
  }, [
    user,
    isLoaded,
    dispatch,
    state.fbUser,
    state.userExist,
    state.fbUserExist,
  ]);

  return (
    <MoviesContext.Provider
      value={{
        state,
        dispatch,
        toggleDrawer,
        addToWatchList,
        removeFromHistoryList,
        updateSearchList,
        updateFormData,
        handleSelectMovie,
        loadWatchList,
        loadHistoryList,
        removeFromWatchList,
        addToHistoryList,
        loadPostList,
        addNewPost,
        removeFromPostList,
        removeFromComments,
        addToComments,
        loadComments,
        increasePostComments,
        setNewPostsAvailable,
        toggleThemeMode,
        increasePostLikes,
        increasePostHistory,
        increasePostWatchList,
      }}
    >
      {children}
    </MoviesContext.Provider>
  );
}

function useMovies() {
  const context = useContext(MoviesContext);

  if (!context) {
    throw new Error("useMovies must be used within an MoviesProvider");
  }

  return context;
}

export { MoviesProvider, useMovies };
