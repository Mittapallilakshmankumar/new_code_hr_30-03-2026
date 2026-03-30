import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import FullScreenLoader from "../components/FullScreenLoader";

const MIN_LOADER_VISIBLE_MS = 1200;

const LoadingContext = createContext({
  loading: false,
  setLoading: () => {},
});

export function LoadingProvider({ children }) {
  const [loading, setLoading] = useState(false);
  const activeRequestsRef = useRef(0);
  const visibleSinceRef = useRef(0);
  const hideTimeoutRef = useRef(null);

  const updateLoading = useCallback((nextLoading) => {
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
  }, [loading]);

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
export function useLoading() {
  return useContext(LoadingContext);
}
