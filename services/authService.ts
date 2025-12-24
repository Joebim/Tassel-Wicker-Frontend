import type {
  RegisterCredentials,
  LoginCredentials,
  AuthUser,
  User,
} from "@/types/user";
import { useAuthStore } from "@/store/authStore";
import { useToastStore } from "@/store/toastStore";
import { apiFetch } from "@/services/apiClient";

function getDisplayName(user: User) {
  return `${user.firstName} ${user.lastName}`.trim() || user.email;
}

export const authService = {
  async signUp(payload: RegisterCredentials) {
    try {
      const { setLoading, setAuth } = useAuthStore.getState();
      setLoading(true);

      const data = await apiFetch<AuthUser>("/api/auth/register", {
        method: "POST",
        auth: false,
        body: JSON.stringify(payload),
      });

      setAuth({
        user: data.user,
        token: data.token,
        refreshToken: data.refreshToken,
      });
      setLoading(false);

      useToastStore.getState().addToast({
        type: "success",
        title: "Account Created",
        message: `Welcome ${getDisplayName(
          data.user
        )}! Your account has been created successfully.`,
      });

      return { success: true as const, user: data.user };
    } catch (error: unknown) {
      useAuthStore.getState().setLoading(false);
      const message =
        error instanceof Error
          ? error.message
          : "Failed to create account. Please try again.";
      useToastStore.getState().addToast({
        type: "error",
        title: "Sign Up Failed",
        message,
      });
      return { success: false as const, error: message };
    }
  },

  async signIn(payload: LoginCredentials) {
    try {
      const { setLoading, setAuth } = useAuthStore.getState();
      setLoading(true);

      const data = await apiFetch<AuthUser>("/api/auth/login", {
        method: "POST",
        auth: false,
        body: JSON.stringify(payload),
      });

      setAuth({
        user: data.user,
        token: data.token,
        refreshToken: data.refreshToken,
      });
      setLoading(false);

      useToastStore.getState().addToast({
        type: "success",
        title: "Welcome Back",
        message: `Hello ${getDisplayName(
          data.user
        )}! You've been signed in successfully.`,
      });

      return { success: true as const, user: data.user };
    } catch (error: unknown) {
      useAuthStore.getState().setLoading(false);
      const message =
        error instanceof Error
          ? error.message
          : "Failed to sign in. Please check your credentials.";
      useToastStore.getState().addToast({
        type: "error",
        title: "Sign In Failed",
        message,
      });
      return { success: false as const, error: message };
    }
  },

  async logout() {
    const { refreshToken, logout, setLoading } = useAuthStore.getState();
    try {
      setLoading(true);
      if (refreshToken) {
        await apiFetch<{ success: boolean }>("/api/auth/logout", {
          method: "POST",
          auth: false,
          body: JSON.stringify({ refreshToken }),
          retryOnAuthFail: false,
        });
      }
    } catch {
      // Even if backend logout fails, we still clear local auth
    } finally {
      logout();
      setLoading(false);
      useToastStore.getState().addToast({
        type: "info",
        title: "Signed Out",
        message: "You have been successfully signed out.",
      });
    }
    return { success: true as const };
  },

  async bootstrap() {
    const { token, user, setUser } = useAuthStore.getState();
    if (!token) return;

    // If we already have a persisted user, we can still validate silently.
    try {
      const data = await apiFetch<{ user: User }>("/api/auth/me", {
        method: "GET",
        auth: true,
        retryOnAuthFail: true,
      });
      setUser(data.user);
    } catch (error: unknown) {
      // If token refresh fails, apiFetch will throw; clear auth quietly
      // (don't toast here to avoid noisy initial load)
      // keep UX stable by only clearing when definitely unauthorized
      const err = error as { status?: number };
      if (err?.status === 401 || err?.status === 403) {
        useAuthStore.getState().logout();
      }
    }
  },
};
