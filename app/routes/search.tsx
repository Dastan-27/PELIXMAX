import { useEffect } from "react";
import { useSearchParams } from "react-router";
import type { Route } from "./+types/search";
import { searchMedia } from "~/lib/tmdb.server";
import { useAppState } from "~/lib/state";
import { MovieGrid } from "~/components/MovieGrid";

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const query = url.searchParams.get("q") ?? "";
  const mediaType = (url.searchParams.get("mediaType") ?? "movie") as "movie" | "tv";

  if (!query.trim()) {
    return { query: "", results: [], mediaType };
  }

  const results = await searchMedia(query.trim(), mediaType);
  return { query: query.trim(), results, mediaType };
}

export function meta({ data }: Route.MetaArgs) {
  const q = data?.query ?? "";
  return [
    { title: q ? `Search: ${q} - PelixMax` : "Search - PelixMax" },
    { name: "description", content: q ? `Search results for "${q}"` : "Search movies and TV shows" },
  ];
}

export default function Search({ loaderData }: Route.ComponentProps) {
  const { query, results } = loaderData;
  const { setViewMode } = useAppState();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentMediaType = searchParams.get("mediaType") ?? "movie";

  useEffect(() => {
    setViewMode("search");
  }, [setViewMode]);

  function handleMediaTypeChange(newType: string) {
    setSearchParams((prev) => {
      prev.set("mediaType", newType);
      prev.set("q", query);
      return prev;
    });
  }

  if (!query) {
    return (
      <div className="py-16 text-center">
        <p className="text-gray-500 dark:text-gray-400">Enter a search term to find movies and TV shows</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Results for "{query}"
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {results.length} results found
          </p>
        </div>

        <div className="flex rounded-lg border border-gray-300 dark:border-gray-600" role="tablist">
          <button
            role="tab"
            aria-selected={currentMediaType === "movie"}
            onClick={() => handleMediaTypeChange("movie")}
            className={`rounded-l-lg px-4 py-2 text-sm font-medium transition-colors ${
              currentMediaType === "movie"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            }`}
          >
            Movies
          </button>
          <button
            role="tab"
            aria-selected={currentMediaType === "tv"}
            onClick={() => handleMediaTypeChange("tv")}
            className={`rounded-r-lg px-4 py-2 text-sm font-medium transition-colors ${
              currentMediaType === "tv"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            }`}
          >
            TV Shows
          </button>
        </div>
      </div>

      <MovieGrid
        items={results}
        emptyMessage={`No ${currentMediaType === "movie" ? "movies" : "TV shows"} found for "${query}"`}
      />
    </div>
  );
}
