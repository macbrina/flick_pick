import { auth } from "@/app/_firebase/config";
import {
  onAuthStateChanged as _onAuthStateChanged,
  GithubAuthProvider,
  GoogleAuthProvider,
  signInWithPopup,
  browserLocalPersistence,
  browserSessionPersistence,
  setPersistence,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { toast } from "react-toastify";
import {
  addSocialAuthUser,
  checkUserExistsByEmail,
  addUser,
  checkUsernameExists,
} from "@/app/_lib/data-service";
import Cookies from "js-cookie";
import {
  generateUniqueId,
  getChatLimitBasedOnPlan,
  getHistoryLimitBasedOnPlan,
  getPostLimitBasedOnPlan,
  getScrapeLimitBasedOnPlan,
  getWatchListLimitBasedOnPlan,
} from "../_utils/utilities";

export function onAuthStateChanged(cb) {
  return _onAuthStateChanged(auth, cb);
}

async function signInWithProvider(provider) {
  try {
    provider.setCustomParameters({
      prompt: "select_account",
    });

    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    const token = await user.getIdToken();

    await updateUser(user);
    Cookies.set("auth_token", token, {
      path: "/",
    });

    window.location.href = "/";
  } catch (err) {
    toast.error(err.message);
  }
}

export async function googleAuth() {
  const provider = new GoogleAuthProvider();
  await signInWithProvider(provider);
}

export async function githubAuth() {
  const provider = new GithubAuthProvider();
  await signInWithProvider(provider);
}

async function generateUniqueUsername(baseUsername) {
  let username = baseUsername;
  let exists = await checkUsernameExists(username);

  while (exists) {
    const randomNumber = Math.floor(Math.random() * 10000);
    username = `${baseUsername}${randomNumber}`;
    exists = await checkUsernameExists(username);
  }

  return username;
}

async function updateUser(user) {
  const userExist = await checkUserExistsByEmail(user.email);

  if (!userExist) {
    const baseUsername = user.displayName.split(" ")[0];
    const username = await generateUniqueUsername(baseUsername);

    const userId = user.uid;
    const subscriptionId = generateUniqueId();
    const userData = {
      userId: user.uid,
      email: user.email,
      avatarUrl: user.photoURL || "/images/user-avatar.png",
      username: username,
      subscriptionId: subscriptionId,
      isPremium: false,
      isActive: false,
      role: "user",
      createdAt: new Date(),
    };

    const subscriptionData = {
      userId: user.uid,
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

    await addSocialAuthUser(userId, userData, subscriptionData);
  }
}

export async function signInSystem({ email, password, rememberMe }) {
  try {
    await setPersistence(
      auth,
      rememberMe ? browserLocalPersistence : browserSessionPersistence
    );
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
    const token = await user.getIdToken();

    Cookies.set("auth_token", token, {
      expires: rememberMe ? 2 : undefined,
      path: "/",
    });
  } catch (error) {
    throw error;
  }
}

export async function signUpSystem({ username, email, password }) {
  const usernameExists = await checkUsernameExists(username);

  if (usernameExists) {
    throw new Error("Username already exists, please choose another one.");
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
    const token = await user.getIdToken();

    const userId = user.uid;
    const subscriptionId = generateUniqueId();

    const userData = {
      userId: user.uid,
      email,
      avatarUrl: "/images/user-avatar.png",
      username,
      subscriptionId: subscriptionId,
      isPremium: false,
      isActive: false,
      role: "user",
      createdAt: new Date(),
    };

    const subscriptionData = {
      userId: user.uid,
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

    await addUser(userId, userData, subscriptionData);
    Cookies.set("auth_token", token, {
      path: "/",
    });
  } catch (error) {
    throw error;
  }
}

export async function logOut() {
  try {
    await auth.signOut();

    Cookies.remove("auth_token", { path: "/" });

    window.location.href = "/";
  } catch (error) {
    toast.error(error.message);
  }
}
