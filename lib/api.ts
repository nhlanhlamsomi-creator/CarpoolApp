import { useAuth } from "@clerk/expo";
import { useCallback, useEffect, useRef, useState } from "react";

const configuredApiUrl = process.env.EXPO_PUBLIC_API_URL?.trim().replace(/\/+$/, "");

function buildApiUrl(baseUrl: string, path: string): string {
  const normalizedBaseUrl = baseUrl.replace(/\/+$/, "");
  const normalizedPath = path.replace(/^\/+/, "");
  const pathWithoutDuplicateApiPrefix =
    /\/api$/i.test(normalizedBaseUrl) && /^api(?:\/|$)/i.test(normalizedPath)
      ? normalizedPath.replace(/^api\/?/i, "")
      : normalizedPath;

  return `${normalizedBaseUrl}/${pathWithoutDuplicateApiPrefix}`;
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null,
): Promise<T> {
  if (!configuredApiUrl) {
    throw new Error(
      "Missing EXPO_PUBLIC_API_URL. Configure the backend URL and restart Expo.",
    );
  }

  if (
    configuredApiUrl.startsWith("http://") &&
    !__DEV__
  ) {
    throw new Error("The backend URL must use HTTPS outside development.");
  }

  const headers = new Headers(options.headers);
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(buildApiUrl(configuredApiUrl, path), {
    ...options,
    headers,
  });
  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      typeof body?.error === "string"
        ? body.error
        : `API request failed with status ${response.status}`,
    );
  }

  return body as T;
}

export function useApiFetch<T>(path: string) {
  const { getToken, userId } = useAuth();
  const getTokenRef = useRef(getToken);
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getTokenRef.current = getToken;
  }, [getToken]);

  const refetch = useCallback(async () => {
    if (!userId) {
      setData(null);
      return;
    }

    setLoading(true);
    try {
      const token = await getTokenRef.current();
      const result = await apiRequest<{ data: T }>(
        path,
        { method: "GET" },
        token,
      );
      setData(result.data ?? null);
      setError(null);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to load data",
      );
    } finally {
      setLoading(false);
    }
  }, [path, userId]);

  return { data, error, loading, refetch };
}