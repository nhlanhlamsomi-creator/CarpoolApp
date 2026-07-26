import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export const fetchAPI = async (url: string, options?: RequestInit) => {
  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`HTTP error! status: ${response.status} ${body}`);
    }

    return await response.json();
  } catch (error) {
    console.warn("Fetch error:", error);
    throw error;
  }
};

export const useFetch = <T>(url: string, options?: RequestInit) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // `options` was in the dependency array as a raw object. Callers pass inline
  // objects, which are a new reference on every render, so fetchData changed
  // every render and the effect re-fired forever. Comparing the serialised
  // form instead keeps it stable.
  const optionsKey = useMemo(
    () => (options ? JSON.stringify(options) : ""),
    [options],
  );

  // Guards against a slow early response overwriting a later one, and against
  // setting state after the screen has unmounted.
  const requestId = useRef(0);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const fetchData = useCallback(async () => {
    const id = ++requestId.current;

    setLoading(true);
    setError(null);

    try {
      const result = await fetchAPI(url, options);

      if (!mounted.current || id !== requestId.current) return;
      setData(result?.data ?? null);
    } catch (err) {
      if (!mounted.current || id !== requestId.current) return;
      setError((err as Error).message);
    } finally {
      if (mounted.current && id === requestId.current) setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, optionsKey]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};