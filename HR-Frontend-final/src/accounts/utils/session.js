import {
  createElement,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getCurrentUserApi, loginApi, logoutApi } from "../api/authApi";
import {
  ACCESS_TOKEN_KEY,
  AUTH_LOGOUT_EVENT,
  REFRESH_TOKEN_KEY,
  clearAuthTokens,
  getAccessToken,
  getRefreshToken,
  setAuthTokens,
} from "../api/axios";
import { getDefaultRouteForRole } from "./constants";

const AuthContext = createContext(null);

function extractErrorMessage(error, fallback) {
  const responseData = error?.response?.data;
  const nonFieldErrors = responseData?.non_field_errors;

  if (typeof responseData?.detail === "string") {
    return responseData.detail;
  }

  if (typeof responseData?.message === "string") {
    return responseData.message;
  }

  if (Array.isArray(nonFieldErrors) && nonFieldErrors[0]) {
    return nonFieldErrors[0];
  }

  if (responseData && typeof responseData === "object") {
    const firstFieldError = Object.values(responseData)
      .flatMap((value) => (Array.isArray(value) ? value : [value]))
      .find((value) => typeof value === "string");

    if (firstFieldError) {
      return firstFieldError;
    }
  }

  return (
    error?.message ||
    fallback
  );
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  const refreshUser = async () => {
    const nextUser = await getCurrentUserApi();
    setUser(nextUser);
    return nextUser;
  };

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      if (!getAccessToken()) {
        if (mounted) {
          setUser(null);
          setIsBootstrapping(false);
        }
        return;
      }

      try {
        const nextUser = await getCurrentUserApi();
        if (mounted) {
          setUser(nextUser);
        }
      } catch {
        clearAuthTokens();
        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setIsBootstrapping(false);
        }
      }
    }

    function handleLogout() {
      setUser(null);
      setIsBootstrapping(false);
    }

    function handleStorage(event) {
      if (![ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY].includes(event.key)) {
        return;
      }

      console.warn(
        "Auth token changed in another tab. This app now uses sessionStorage per tab, so shared-token changes usually indicate legacy localStorage data or manual storage edits."
      );
    }

    bootstrap();
    window.addEventListener(AUTH_LOGOUT_EVENT, handleLogout);
    window.addEventListener("storage", handleStorage);

    return () => {
      mounted = false;
      window.removeEventListener(AUTH_LOGOUT_EVENT, handleLogout);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      role: user?.role || null,
      isAuthenticated: Boolean(user && getAccessToken()),
      isBootstrapping,
      async login(credentials) {
        const tokens = await loginApi(credentials);
        setAuthTokens(tokens);
        try {
          const nextUser = await getCurrentUserApi();
          setUser(nextUser);
          return nextUser;
        } catch (error) {
          clearAuthTokens();
          throw error;
        }
      },
      getDefaultRoute(role = user?.role) {
        return getDefaultRouteForRole(role);
      },
      async logout() {
        const refresh = getRefreshToken();
        if (refresh) {
          try {
            await logoutApi({ refresh });
          } catch {
            // Client-side logout must still succeed if revocation is unavailable.
          }
        }
        clearAuthTokens();
        setUser(null);
        window.dispatchEvent(new CustomEvent(AUTH_LOGOUT_EVENT));
      },
      refreshUser,
      extractErrorMessage,
    }),
    [user, isBootstrapping]
  );

  return createElement(AuthContext.Provider, { value }, children);
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider.");
  }

  return context;
}

export function useAppRole() {
  const { role } = useAuth();
  return [role, () => {}];
}
