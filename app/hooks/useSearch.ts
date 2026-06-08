import { useEffect, useRef } from "react";
import { useFetcher } from "react-router";
import { useDebounce } from "~/hooks/useDebounce";
import { useAppState } from "~/lib/state";
import type { TMDBMedia } from "~/lib/types";

export function useSearch() {
  const { state, setSearchResults, setQuery, setLoading, setError } = useAppState();
  const fetcher = useFetcher<{ ok: boolean; results: TMDBMedia[]; error?: string }>();
  const debouncedQuery = useDebounce(state.query, 400);
  const previousQuery = useRef("");

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setSearchResults([]);
      return;
    }

    if (debouncedQuery === previousQuery.current) return;
    previousQuery.current = debouncedQuery;

    setLoading(true);
    const params = new URLSearchParams({
      action: "search",
      query: debouncedQuery.trim(),
      mediaType: state.selectedMediaType,
    });
    fetcher.load(`/api/tmdb?${params}`);
  }, [debouncedQuery, state.selectedMediaType]);

  useEffect(() => {
    if (fetcher.data) {
      setLoading(false);
      if (fetcher.data.ok) {
        setSearchResults(fetcher.data.results);
        setError(null);
      } else {
        setError(fetcher.data.error ?? "Search failed");
        setSearchResults([]);
      }
    }
  }, [fetcher.data]);

  return {
    query: state.query,
    results: state.searchResults,
    loading: state.loading,
    error: state.error,
    setQuery,
  };
}
