export function movieReducer(state, action) {
  switch (action.type) {
    case "TOGGLE_DRAWER_MODE":
      return {
        ...state,
        drawerOpen: !state.drawerOpen,
      };

    case "SET_WATCH_LIST":
      return {
        ...state,
        watchList: action.payload,
      };
    case "ADD_TO_WATCH_LIST":
      return {
        ...state,
        watchList: [...state.watchList, action.payload],
      };

    case "REMOVE_FROM_WATCH_LIST":
      return {
        ...state,
        watchList: state.watchList.filter((item) => item.id !== action.payload),
      };
    case "SET_WATCHLIST_LOADING":
      return {
        ...state,
        watchlistLoading: action.payload,
      };
    case "SET_HISTORY_LIST":
      return {
        ...state,
        historyList: action.payload,
      };
    case "SET_HISTORY_LOADING":
      return {
        ...state,
        historyLoading: action.payload,
      };
    case "ADD_TO_HISTORY":
      return {
        ...state,
        historyList: [...state.historyList, action.payload],
      };
    case "REMOVE_FROM_HISTORY":
      return {
        ...state,
        historyList: state.historyList.filter(
          (item) => item.id !== action.payload
        ),
      };
    case "SET_POST_LIST":
      return {
        ...state,
        publicPosts: action.payload,
      };
    case "SET_POSTS_LOADING":
      return {
        ...state,
        publicPostLoading: action.payload,
      };
    case "ADD_TO_POST":
      return {
        ...state,
        publicPosts: [...state.publicPosts, action.payload],
      };
    case "REMOVE_FROM_POST":
      return {
        ...state,
        publicPosts: state.publicPosts.filter(
          (item) => item.id !== action.payload
        ),
      };
    case "SET_COMMENT_LIST":
      return {
        ...state,
        comments: action.payload,
      };
    case "SET_COMMENTS_LOADING":
      return {
        ...state,
        commentsLoading: action.payload,
      };
    case "ADD_TO_COMMENT":
      return {
        ...state,
        comments: [action.payload, ...state.comments],
      };
    case "REMOVE_FROM_COMMENT":
      return {
        ...state,
        comments: state.comments.filter((item) => item.id !== action.payload),
      };
    case "UPDATE_POST_COMMENTS":
      return {
        ...state,
        publicPosts: state.publicPosts.map((post) =>
          post.id === action.payload.postId
            ? {
                ...post,
                movie: {
                  ...post.movie,
                  commentsCount:
                    action.payload.operation === "add"
                      ? post.movie.commentsCount + 1
                      : post.movie.commentsCount - 1,
                },
              }
            : post
        ),
      };
    case "SET_USEREXIST_LOADING":
      return {
        ...state,
        userExist: action.payload,
      };
    case "SET_FBUSEREXIST_LOADING":
      return {
        ...state,
        fbUserExist: action.payload,
      };
    case "SET_SEARCH_LOADING":
      return {
        ...state,
        searchLoading: action.payload,
      };
    case "SET_SEARCH_ERROR":
      return {
        ...state,
        searchError: action.payload,
      };
    case "SET_SELECTED_ID":
      return {
        ...state,
        selectedId: action.payload,
      };
    case "SET_COLLECTION_TOGGLE":
      return {
        ...state,
        openCollectionModal: action.payload,
      };
    case "SET_SEARCH_LIST":
      return {
        ...state,
        searchCollections: action.payload,
      };
    case "SET_FBUSER":
      return {
        ...state,
        fbUser: action.payload,
      };
    case "SET_PATHNAME":
      return {
        ...state,
        pathname: action.payload,
      };
    case "UPDATE_FORM_DATA":
      return {
        ...state,
        formData: {
          ...state.formData,
          ...action.payload,
        },
      };
    default:
      return state;
  }
}
