import { useEffect } from "react";
import { useFetcher } from "react-router";
import { useAppState } from "~/lib/state";
import type { TMDBMedia } from "~/lib/types";

export function useTrending() {
  const { state, setTrending, setLoading, setError } = useAppState();
  const fetcher = useFetcher<{ ok: boolean; results: TMDBMedia[]; error?: string }>();

  useEffect(() => {
    if (state.trending.length > 0) return;

    setLoading(true);
    const params = new URLSearchParams({
      action: "trending",
      mediaType: state.selectedMediaType,
    });
    fetcher.load(`/api/tmdb?${params}`);
  }, [state.selectedMediaType]);

  useEffect(() => {
    if (fetcher.data) {
      setLoading(false);
      if (fetcher.data.ok) {
        setTrending(fetcher.data.results);
        setError(null);
      } else {
        setError(fetcher.data.error ?? "Failed to load trending");
      }
    }
  }, [fetcher.data]);

  return {
    trending: state.trending,
    loading: state.loading,
    error: state.error,
  };
}
