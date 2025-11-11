import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { useAuthStore, type User } from "../store/authStore";
import { useToastStore } from "../store/toastStore";

// Check if Firebase config is available
const getFirebaseConfig = () => {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  const messagingSenderId =
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
  const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;
  const measurementId = process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID;

  if (!apiKey || !authDomain || !projectId) {
    console.warn(
      "Firebase configuration is incomplete. Please set NEXT_PUBLIC_FIREBASE_* environment variables."
    );
    return null;
  }

  return {
    apiKey,
    authDomain,
    projectId,
    storageBucket: storageBucket || "",
    messagingSenderId: messagingSenderId || "",
    appId: appId || "",
    measurementId: measurementId || "",
  };
};

const firebaseConfig = getFirebaseConfig();
let app: ReturnType<typeof initializeApp> | null = null;
let auth: ReturnType<typeof getAuth> | null = null;

if (firebaseConfig) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
  } catch (error) {
    console.error("Failed to initialize Firebase:", error);
  }
}

export { auth };

export const authService = {
  async signUp(email: string, password: string, displayName: string) {
    if (!auth) {
      const errorMessage =
        "Firebase is not configured. Please set up your environment variables.";
      useToastStore.getState().addToast({
        type: "error",
        title: "Configuration Error",
        message: errorMessage,
      });
      return { success: false, error: errorMessage };
    }

    try {
      const { setUser, setLoading } = useAuthStore.getState();
      setLoading(true);

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      await updateProfile(userCredential.user, { displayName });

      const user: User = {
        uid: userCredential.user.uid,
        email: userCredential.user.email!,
        displayName: displayName,
      };

      setUser(user);
      setLoading(false);
      useToastStore.getState().addToast({
        type: "success",
        title: "Account Created",
        message: `Welcome ${displayName}! Your account has been created successfully.`,
      });
      return { success: true, user };
    } catch (error: unknown) {
      const { setLoading } = useAuthStore.getState();
      setLoading(false);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to create account. Please try again.";
      useToastStore.getState().addToast({
        type: "error",
        title: "Sign Up Failed",
        message: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  },

  async signIn(email: string, password: string) {
    if (!auth) {
      const errorMessage =
        "Firebase is not configured. Please set up your environment variables.";
      useToastStore.getState().addToast({
        type: "error",
        title: "Configuration Error",
        message: errorMessage,
      });
      return { success: false, error: errorMessage };
    }

    try {
      const { setUser, setLoading } = useAuthStore.getState();
      setLoading(true);

      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user: User = {
        uid: userCredential.user.uid,
        email: userCredential.user.email!,
        displayName: userCredential.user.displayName || "",
      };

      setUser(user);
      setLoading(false);
      useToastStore.getState().addToast({
        type: "success",
        title: "Welcome Back",
        message: `Hello ${
          user.displayName || user.email
        }! You've been signed in successfully.`,
      });
      return { success: true, user };
    } catch (error: unknown) {
      const { setLoading } = useAuthStore.getState();
      setLoading(false);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to sign in. Please check your credentials.";
      useToastStore.getState().addToast({
        type: "error",
        title: "Sign In Failed",
        message: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  },

  async logout() {
    if (!auth) {
      return { success: false, error: "Firebase is not configured." };
    }

    try {
      await signOut(auth);
      const { logout } = useAuthStore.getState();
      logout();
      useToastStore.getState().addToast({
        type: "info",
        title: "Signed Out",
        message: "You have been successfully signed out.",
      });
      return { success: true };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to sign out. Please try again.";
      useToastStore.getState().addToast({
        type: "error",
        title: "Logout Failed",
        message: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  },
};
