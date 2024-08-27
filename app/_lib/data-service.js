import { db, storage } from "@/app/_firebase/config";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  limit,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  startAfter,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { getDownloadURL, listAll, ref, uploadBytes } from "firebase/storage";

export const fetchAllAvatars = async () => {
  try {
    const avatarsRef = ref(storage, "avatars");
    const result = await listAll(avatarsRef);
    const imageUrls = await Promise.all(
      result.items.map(async (itemRef) => {
        const url = await getDownloadURL(itemRef);
        return { name: itemRef.name, url };
      })
    );
    return imageUrls;
  } catch (error) {
    console.error("Error fetching avatars:", error);
    throw error;
  }
};

export const saveUserAvatar = async (userId, avatarUrl) => {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      avatarUrl,
    });
  } catch (error) {
    console.error("Error updating user avatar:", error);
    throw error;
  }
};

export const checkAndAddUserToFirestore = async (userId, userData) => {
  try {
    const userDocRef = doc(db, "users", userId);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      await setDoc(userDocRef, userData, { merge: true });
    } else {
      await setDoc(userDocRef, userData);
    }
  } catch (error) {
    throw error;
  }
};

export const getUserPartialData = async (userId) => {
  const userDocRef = doc(db, "users", userId);
  const userDoc = await getDoc(userDocRef);

  if (!userDoc.exists()) {
    throw new Error("User not found");
  }

  const userData = userDoc.data();

  return {
    userId: userData.userId,
    username: userData.username,
    avatarUrl: userData.avatarUrl,
  };
};

export const getUserProfileData = async (userId) => {
  try {
    const userDocRef = doc(db, "users", userId);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      throw new Error("User not found");
    }

    const userData = userDoc.data();

    const posts = await fetchUserPosts(userId);
    // const comments = await fetchUserComments(userId);
    // const likes = await fetchUserLikes(userId);
    const watchlist = await fetchUserWatchlist(userId);
    const movieHistory = await fetchUserMovieHistory(userId);
    const chatHistory = await fetchUserChatHistory(userId);

    return {
      ...userData,
      posts,
      watchlist,
      movieHistory,
      chatHistory,
    };
  } catch (error) {
    console.error("Error fetching user profile data:", error);
    throw error;
  }
};

export const getNewsfeedPosts = async () => {
  try {
    const postsQuery = query(
      collection(db, "posts"),
      orderBy("createdAt", "desc"),
      limit(50)
    );

    const postsSnapshot = await getDocs(postsQuery);
    const posts = postsSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        postId: data.postId,
        user: {
          username: data.username,
          avatarUrl:
            data.avatarUrl ||
            "https://firebasestorage.googleapis.com/v0/b/flickpick-3210d.appspot.com/o/avatars%2FadventurerNeutral-1724685234808.avif?alt=media&token=3f1b95be-cd09-4fdc-b76d-0e66c3584221",
        },
        movie: {
          title: data.movieTitle || "Untitled",
          imageUrl: data.movieImage,
          description: data.postContent,
          videoUrl: data.movieVideo || "",
          likesCount: data.likesCount || 0,
          commentsCount: data.commentsCount || 0,
        },
        postTime: data.createdAt ? data.createdAt.toDate() : new Date(),
      };
    });

    return posts;
  } catch (error) {
    console.error("Error fetching newsfeed posts:", error);
    throw error;
  }
};

export async function getPostComments(
  postId,
  startAfterDoc = null,
  limitCount = 3
) {
  try {
    const commentsRef = collection(db, "comments");
    let q = query(
      commentsRef,
      where("postId", "==", postId),
      orderBy("createdAt", "desc"),
      limit(limitCount)
    );

    if (startAfterDoc) {
      q = query(q, startAfter(startAfterDoc));
    }

    const querySnapshot = await getDocs(q);
    const comments = [];
    let lastVisible = null;

    querySnapshot.forEach((doc) => {
      comments.push({ id: doc.id, ...doc.data() });
      lastVisible = doc;
    });

    return { comments, lastVisible };
  } catch (error) {
    console.error("Error fetching comments:", error);
    throw new Error("Failed to fetch comments");
  }
}

export const fetchUserChatHistory = async (userId) => {
  try {
    const chatQuery = query(
      collection(db, "chatHistory"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    const chatSnapshot = await getDocs(chatQuery);
    const chatHistory = chatSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return chatHistory;
  } catch (error) {
    console.error("Error fetching chat history:", error);
    throw error;
  }
};

export const fetchUserPosts = async (userId) => {
  try {
    const postQuery = query(
      collection(db, "posts"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    const postSnapshot = await getDocs(postQuery);
    const postHistory = postSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return postHistory;
  } catch (error) {
    console.error("Error fetching user posts:", error);
    throw error;
  }
};

export const fetchUserWatchlist = async (userId) => {
  try {
    const watchlistQuery = query(
      collection(db, "watchlist"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    const watchlistSnapshot = await getDocs(watchlistQuery);
    const watchlist = watchlistSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return watchlist;
  } catch (error) {
    console.error("Error fetching watchlist:", error);
    throw error;
  }
};

export const fetchUserMovieHistory = async (userId) => {
  try {
    const movieHistoryQuery = query(
      collection(db, "movieHistory"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );

    const movieHistorySnapshot = await getDocs(movieHistoryQuery);
    const movieHistory = movieHistorySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return movieHistory;
  } catch (error) {
    console.error("Error fetching movie history:", error);
    throw error;
  }
};

export const addComment = async (comment) => {
  try {
    const commentRef = await addDoc(collection(db, "comments"), {
      ...comment,
      createdAt: Timestamp.now(),
    });

    const postRef = doc(db, "posts", comment.postId);

    await updateDoc(postRef, {
      commentsCount: increment(1),
    });

    const addedCommentDoc = await getDoc(commentRef);

    if (!addedCommentDoc.exists()) {
      throw new Error("Added comment document not found");
    }

    return {
      id: commentRef.id,
      ...addedCommentDoc.data(),
    };
  } catch (error) {
    console.error("Error adding comment:", error);
    throw error;
  }
};

export const addPost = async (post) => {
  try {
    const postRef = doc(db, "posts", post.postId);

    await setDoc(postRef, {
      ...post,
      createdAt: Timestamp.now(),
    });
    return postRef.id;
  } catch (error) {
    console.error("Error adding post:", error);
    throw error;
  }
};

export const addChatMessage = async (message) => {
  try {
    const chatRef = await addDoc(collection(db, "chatHistory"), {
      ...message,
      createdAt: Timestamp.now(),
    });
    return chatRef.id;
  } catch (error) {
    console.error("Error adding chat message:", error);
    throw error;
  }
};

export const addToWatchlist = async (movie) => {
  try {
    const watchlistRef = await addDoc(collection(db, "watchlist"), {
      ...movie,
      createdAt: Timestamp.now(),
    });

    const addedMovieRef = doc(db, "watchlist", watchlistRef.id);
    const addedMovieDoc = await getDoc(addedMovieRef);

    if (!addedMovieDoc.exists()) {
      throw new Error("Added movie document not found");
    }
    return {
      id: watchlistRef.id,
      ...addedMovieDoc.data(),
    };
  } catch (error) {
    console.error("Error adding to watchlist:", error);
    throw error;
  }
};

export const addToMovieHistory = async (movie) => {
  try {
    const movieHistoryRef = await addDoc(collection(db, "movieHistory"), {
      ...movie,
      createdAt: Timestamp.now(),
    });

    const addedMovieRef = doc(db, "movieHistory", movieHistoryRef.id);
    const addedMovieDoc = await getDoc(addedMovieRef);

    if (!addedMovieDoc.exists()) {
      throw new Error("Added movie document not found");
    }

    return {
      id: addedMovieRef.id,
      ...addedMovieDoc.data(),
    };
  } catch (error) {
    console.error("Error adding to movie history:", error);
    throw error;
  }
};

export const deleteComment = async (commentId, postId) => {
  try {
    const commentRef = doc(db, "comments", commentId);
    await deleteDoc(commentRef);

    const postRef = doc(db, "posts", postId);
    await updateDoc(postRef, {
      commentsCount: increment(-1),
    });
  } catch (error) {
    console.error("Error deleting comment:", error);
    throw error;
  }
};

export const deletePost = async (postId) => {
  try {
    const postRef = doc(db, "posts", postId);
    await deleteDoc(postRef);
  } catch (error) {
    console.error("Error deleting post:", error);
    throw error;
  }
};

export const deleteChatMessage = async (messageId) => {
  try {
    const chatRef = doc(db, "chatHistory", messageId);
    await deleteDoc(chatRef);
  } catch (error) {
    console.error("Error deleting chat message:", error);
    throw error;
  }
};

export const deleteWatchlistItem = async (itemId) => {
  try {
    const watchlistRef = doc(db, "watchlist", itemId);
    await deleteDoc(watchlistRef);
  } catch (error) {
    console.error("Error deleting watchlist item:", error);
    throw error;
  }
};

export const deleteMovieHistoryItem = async (itemId) => {
  try {
    const movieHistoryRef = doc(db, "movieHistory", itemId);
    await deleteDoc(movieHistoryRef);
  } catch (error) {
    console.error("Error deleting movie history item:", error);
    throw error;
  }
};

export const hasUserLikedPost = async (userId, postId) => {
  try {
    const q = query(
      collection(db, "likes"),
      where("userId", "==", userId),
      where("postId", "==", postId)
    );

    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (error) {
    console.error("Error checking like status:", error);
    throw error;
  }
};

export const toggleLike = async (userId, postId) => {
  try {
    // Check if the user has already liked the post
    const q = query(
      collection(db, "likes"),
      where("userId", "==", userId),
      where("postId", "==", postId)
    );

    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      // User has already liked the post, so remove the like
      const likeId = snapshot.docs[0].id; // Get the like ID
      const likeRef = doc(db, "likes", likeId);
      await deleteDoc(likeRef);

      // Decrement the like count in the post
      const postRef = doc(db, "posts", postId);
      await updateDoc(postRef, {
        likesCount: increment(-1),
      });

      console.log("Like removed");
    } else {
      await addDoc(collection(db, "likes"), {
        userId,
        postId,
        createdAt: Timestamp.now(),
      });

      const postRef = doc(db, "posts", postId);
      await updateDoc(postRef, {
        likesCount: increment(1),
      });

      console.log("Like added");
    }
  } catch (error) {
    console.error("Error toggling like:", error);
    throw error;
  }
};

// export const getUserData = async (user) => {
//   try {
//     const q = query(collection(db, "users"), where("userId", "==", user.id));
//     const userSnapshot = await getDocs(q);

//     if (userSnapshot.empty) {
//       throw new Error("No user found with the given ID");
//     }

//     const userDoc = userSnapshot.docs[0];
//     const userData = userDoc.data();

//     if (userData.subscriptionId) {
//       const moviesRef = doc(db, "moviecollections", userData.id);
//       const moviesSnapshot = await getDoc(moviesRef);

//       if (moviesSnapshot.exists()) {
//         const moviesData = moviesSnapshot.data();
//         return {
//           ...userData,
//           movies: moviesData,
//         };
//       } else {
//         return { ...userData, movies: "No movies found" };
//       }
//     } else {
//       return userData;
//     }
//   } catch (error) {
//     throw error;
//   }
// };
