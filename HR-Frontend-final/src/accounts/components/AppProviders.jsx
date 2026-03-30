
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import FullScreenLoader from "./FullScreenLoader";
import apiClient, {
  ACCESS_TOKEN_KEY,
  AUTH_LOGOUT_EVENT,
  REFRESH_TOKEN_KEY,
  clearAuthTokens,
  getAccessToken,
  getDefaultRouteForRole,
  getRefreshToken,
  setAuthTokens,
} from "./appCore";

const MIN_LOADER_VISIBLE_MS = 1200;

const AuthContext = createContext(null);
const LoadingContext = createContext({
  loading: false,
  setLoading: () => {},
});

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

  return error?.message || fallback;
}

async function loginApi(payload) {
  const response = await apiClient.post("auth/login/", payload);
  return response.data;
}

async function logoutApi(payload) {
  const response = await apiClient.post("auth/logout/", payload);
  return response.data;
}

async function getCurrentUserApi() {
  const response = await apiClient.get("auth/me/");
  return response.data;
}

function AuthProvider({ children }) {
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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function LoadingProvider({ children }) {
  const [loading, setLoading] = useState(false);
  const activeRequestsRef = useRef(0);
  const visibleSinceRef = useRef(0);
  const hideTimeoutRef = useRef(null);

  const updateLoading = useCallback(
    (nextLoading) => {
      if (nextLoading) {
        activeRequestsRef.current += 1;

        if (hideTimeoutRef.current) {
          window.clearTimeout(hideTimeoutRef.current);
          hideTimeoutRef.current = null;
        }

        if (!loading) {
          visibleSinceRef.current = Date.now();
          setLoading(true);
        }

        return;
      }

      activeRequestsRef.current = Math.max(activeRequestsRef.current - 1, 0);

      if (activeRequestsRef.current > 0) {
        return;
      }

      const elapsed = Date.now() - visibleSinceRef.current;
      const remaining = Math.max(MIN_LOADER_VISIBLE_MS - elapsed, 0);

      if (remaining === 0) {
        setLoading(false);
        return;
      }

      hideTimeoutRef.current = window.setTimeout(() => {
        setLoading(false);
        hideTimeoutRef.current = null;
      }, remaining);
    },
    [loading]
  );

  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        window.clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  const value = useMemo(
    () => ({
      loading,
      setLoading: updateLoading,
    }),
    [loading, updateLoading]
  );

  return (
    <LoadingContext.Provider value={value}>
      {children}
      {loading ? <FullScreenLoader /> : null}
    </LoadingContext.Provider>
  );
}

export function AppProviders({ children }) {
  return (
    <AuthProvider>
      <LoadingProvider>{children}</LoadingProvider>
    </AuthProvider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider.");
  }

  return context;
}

export function useLoading() {
  return useContext(LoadingContext);
}
