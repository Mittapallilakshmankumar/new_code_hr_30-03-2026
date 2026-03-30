import { useEffect, useRef } from "react";

export default function usePolling(callback, intervalMs, enabled = true) {
  const callbackRef = useRef(callback);
  const runningRef = useRef(false);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled || !intervalMs) {
      return undefined;
    }

    let cancelled = false;

    async function tick() {
      if (runningRef.current || cancelled) {
        return;
      }

      runningRef.current = true;
      try {
        await callbackRef.current();
      } finally {
        runningRef.current = false;
      }
    }

    const intervalId = window.setInterval(tick, intervalMs);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [enabled, intervalMs]);
}
