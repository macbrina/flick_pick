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
import { PAGE_SIZE } from "@/app/_utils/constants";

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

export const checkAndAddUserToFirestore = async (
  userId,
  userData,
  subscriptionData
) => {
  try {
    const userDocRef = doc(db, "users", userId);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      await setDoc(userDocRef, userData, { merge: true });
    } else {
      await setDoc(userDocRef, userData);
      const subscriptionRef = doc(db, "subscriptions", subscriptionData.id);
      await setDoc(subscriptionRef, subscriptionData, { merge: true });
    }
  } catch (error) {
    throw error;
  }
};

export async function checkUserExistsByEmail(email) {
  const usersRef = collection(db, "users");
  const q = query(usersRef, where("email", "==", email));

  const querySnapshot = await getDocs(q);

  return !querySnapshot.empty;
}

export async function checkUsernameExists(username) {
  const usersRef = collection(db, "users");
  const q = query(usersRef, where("username", "==", username));

  const querySnapshot = await getDocs(q);

  return !querySnapshot.empty;
}

export async function addSocialAuthUser(userId, userData, subscriptionData) {
  const usersRef = collection(db, "users", userId);
  try {
    await setDoc(usersRef, userData);
    const subscriptionRef = doc(db, "subscriptions", subscriptionData.id);
    await setDoc(subscriptionRef, subscriptionData, { merge: true });
  } catch (error) {
    throw error;
  }
}

export async function addUser(userId, userData, subscriptionData) {
  const usersRef = collection(db, "users", userId);
  try {
    await setDoc(usersRef, userData);
    const subscriptionRef = doc(db, "subscriptions", subscriptionData.id);
    await setDoc(subscriptionRef, subscriptionData, { merge: true });
  } catch (error) {
    throw error;
  }
}

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

export const getNewsfeedPosts = async (lastPostTimestamp) => {
  try {
    let postsQuery = query(
      collection(db, "posts"),
      orderBy("createdAt", "desc"),
      limit(PAGE_SIZE)
    );

    if (lastPostTimestamp) {
      postsQuery = query(
        collection(db, "posts"),
        orderBy("createdAt", "desc"),
        startAfter(lastPostTimestamp),
        limit(PAGE_SIZE)
      );
    }

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
          userId: data.userId,
          postId: data.postId,
          title: data.movieTitle || "Untitled",
          imageUrl: `https://image.tmdb.org/t/p/w500${data.movieImage}`,
          description: data.postContent,
          videoUrl: data.movieVideo || "",
          likesCount: data.likesCount || 0,
          commentsCount: data.commentsCount || 0,
          watchListCount: data.watchListCount || 0,
          historyCount: data.historyCount || 0,
          movieId: data.movieId,
          movieType: data.movieType,
          release_date: data.movieYear,
          tmdbRating: data.rating,
          runtime: data.runtime,
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

export const subscribeToNewPosts = (
  callback,
  userId = null,
  limitPosts = PAGE_SIZE
) => {
  const postsQuery = query(
    collection(db, "posts"),
    orderBy("createdAt", "desc"),
    limit(limitPosts)
  );

  return onSnapshot(postsQuery, async (snapshot) => {
    const posts = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const data = doc.data();
        let userLiked = false;
        let userWatch = false;
        let userHistory = false;

        if (userId) {
          // Check if the user liked this post
          const likesQuery = query(
            collection(db, "likes"),
            where("postId", "==", data.postId),
            where("userId", "==", userId)
          );
          const watchListQuery = query(
            collection(db, "watchlist"),
            where("postId", "==", data.postId),
            where("userId", "==", userId)
          );
          const historyQuery = query(
            collection(db, "movieHistory"),
            where("postId", "==", data.postId),
            where("userId", "==", userId)
          );
          const likeSnapshot = await getDocs(likesQuery);
          const watchListSnapshot = await getDocs(watchListQuery);
          const historySnapshot = await getDocs(historyQuery);
          userLiked = !likeSnapshot.empty;
          userWatch = !watchListSnapshot.empty;
          userHistory = !historySnapshot.empty;
        }

        return {
          id: doc.id,
          postId: data.postId,
          userLiked,
          userWatch,
          userHistory,
          user: {
            username: data.username,
            avatarUrl:
              data.avatarUrl ||
              "https://firebasestorage.googleapis.com/v0/b/flickpick-3210d.appspot.com/o/avatars%2FadventurerNeutral-1724685234808.avif?alt=media&token=3f1b95be-cd09-4fdc-b76d-0e66c3584221",
          },
          movie: {
            userId: data.userId,
            postId: data.postId,
            title: data.movieTitle || "Untitled",
            imageUrl: `https://image.tmdb.org/t/p/w500${data.movieImage}`,
            description: data.postContent,
            videoUrl: data.movieVideo || "",
            likesCount: data.likesCount || 0,
            commentsCount: data.commentsCount || 0,
            watchListCount: data.watchListCount || 0,
            historyCount: data.historyCount || 0,
            movieId: data.movieId,
            movieType: data.movieType,
            release_date: data.movieYear,
            tmdbRating: data.rating,
            runtime: data.runtime,
          },
          postTime: data.createdAt ? data.createdAt.toDate() : new Date(),
        };
      })
    );
    callback(posts);
  });
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

export const editPost = async (post) => {
  if (!post || !post.postId || !post.description) {
    throw new Error("Invalid post data. Post ID and content are required.");
  }
  try {
    const postRef = doc(db, "posts", post.postId);
    await updateDoc(postRef, {
      postContent: post.description,
    });
    return true;
  } catch (error) {
    console.error("Error editing post:", error);
    throw error;
  }
};
export const saveChatHistory = async (userId, chatEntry) => {
  try {
    const chatDocRef = doc(db, "chatHistory", userId);

    const chatDoc = await getDoc(chatDocRef);

    let updatedChat = [];

    if (chatDoc.exists()) {
      const existingChat = chatDoc.data().messages || [];
      updatedChat = [...existingChat, ...chatEntry.messages];
    } else {
      updatedChat = chatEntry.messages;
    }

    await setDoc(chatDocRef, {
      userId: userId,
      messages: updatedChat,
      updatedAt: chatEntry.updatedAt,
    });
  } catch (error) {
    console.error("Error saving chat history:", error);
    throw error;
  }
};

export const deleteChatHistory = async (userId) => {
  try {
    const commentRef = doc(db, "chatHistory", userId);
    await deleteDoc(commentRef);
  } catch (error) {
    console.error("Error deleting chat:", error);
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

    const commentsQuery = query(
      collection(db, "comments"),
      where("postId", "==", postId)
    );
    const commentsSnapshot = await getDocs(commentsQuery);
    commentsSnapshot.forEach(async (commentDoc) => {
      await deleteDoc(commentDoc.ref);
    });

    const likesQuery = query(
      collection(db, "likes"),
      where("postId", "==", postId)
    );
    const likesSnapshot = await getDocs(likesQuery);
    likesSnapshot.forEach(async (likeDoc) => {
      await deleteDoc(likeDoc.ref);
    });

    console.log("Post deleted successfully!");
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

export const hasUserWatchListPost = async (userId, postId) => {
  try {
    const q = query(
      collection(db, "watchlist"),
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

export const hasUserHistoryPost = async (userId, postId) => {
  try {
    const q = query(
      collection(db, "movieHistory"),
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
    const q = query(
      collection(db, "likes"),
      where("userId", "==", userId),
      where("postId", "==", postId)
    );

    const snapshot = await getDocs(q);

    const postRef = doc(db, "posts", postId);
    const postDoc = await getDoc(postRef);
    const currentLikes = postDoc.exists() ? postDoc.data().likesCount : 0;

    if (!snapshot.empty) {
      if (currentLikes > 0) {
        const likeId = snapshot.docs[0].id;
        const likeRef = doc(db, "likes", likeId);
        await deleteDoc(likeRef);

        await updateDoc(postRef, {
          likesCount: increment(-1),
        });
      }

      return "remove";
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

      return "add";
    }
  } catch (error) {
    console.error("Error toggling like:", error);
    throw error;
  }
};

export const toggleHistory = async (post) => {
  try {
    const q = query(
      collection(db, "movieHistory"),
      where("userId", "==", post.userId),
      where("postId", "==", post.postId)
    );

    const snapshot = await getDocs(q);

    const postRef = doc(db, "posts", post.postId);
    const postDoc = await getDoc(postRef);
    const currentHistories = postDoc.exists() ? postDoc.data().historyCount : 0;

    if (!snapshot.empty) {
      if (currentHistories > 0) {
        const historyId = snapshot.docs[0].id;
        const historyRef = doc(db, "movieHistory", historyId);
        await deleteDoc(historyRef);

        await updateDoc(postRef, {
          historyCount: increment(-1),
        });
      }

      return "remove";
    } else {
      await addDoc(collection(db, "movieHistory"), {
        ...post,
        createdAt: Timestamp.now(),
      });

      const postRef = doc(db, "posts", post.postId);
      await updateDoc(postRef, {
        historyCount: increment(1),
      });

      return "add";
    }
  } catch (error) {
    console.error("Error toggling history:", error);
    throw error;
  }
};

export const toggleWatchList = async (post) => {
  try {
    const q = query(
      collection(db, "watchlist"),
      where("userId", "==", post.userId),
      where("postId", "==", post.postId)
    );

    const snapshot = await getDocs(q);

    const postRef = doc(db, "posts", post.postId);
    const postDoc = await getDoc(postRef);
    const currentWatchlist = postDoc.exists()
      ? postDoc.data().watchListCount
      : 0;

    if (!snapshot.empty) {
      if (currentWatchlist > 0) {
        const watchlistId = snapshot.docs[0].id;
        const watchlistRef = doc(db, "watchlist", watchlistId);
        await deleteDoc(watchlistRef);

        await updateDoc(postRef, {
          watchListCount: increment(-1),
        });
      }

      return "remove";
    } else {
      await addDoc(collection(db, "watchlist"), {
        ...post,
        createdAt: Timestamp.now(),
      });

      const postRef = doc(db, "posts", post.postId);
      await updateDoc(postRef, {
        watchListCount: increment(1),
      });

      return "add";
    }
  } catch (error) {
    console.error("Error toggling watchlist:", error);
    throw error;
  }
};
