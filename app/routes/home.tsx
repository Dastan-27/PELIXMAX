import { useEffect, useCallback, type ReactNode } from "react";
import { useSearchParams } from "react-router";
import type { Route } from "./+types/home";
import { getTrending, getPopular, getTopRated, getUpcoming } from "~/lib/tmdb.server";
import { useAppState } from "~/lib/state";
import { MovieGrid } from "~/components/MovieGrid";
import type { TMDBMedia, MediaType, ViewMode } from "~/lib/types";

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const viewParam = url.searchParams.get("view") as ViewMode | null;
  const mediaTypeParam = url.searchParams.get("mediaType") as MediaType | null;

  const view = viewParam ?? "trending";
  const mediaType = mediaTypeParam ?? "movie";

  const loaders: Record<string, () => Promise<TMDBMedia[]>> = {
    trending: () => getTrending(mediaType, "day"),
    popular: () => getPopular(mediaType),
    top_rated: () => getTopRated(mediaType),
    upcoming: () => getUpcoming(),
  };

  const mainLoader = loaders[view] ?? loaders["trending"];

  try {
    const [main, popular, topRated, trending] = await Promise.all([
      mainLoader(),
      getPopular(mediaType),
      getTopRated(mediaType),
      getTrending(mediaType, "day"),
    ]);

    return {
      main,
      popular,
      topRated,
      trending,
      view,
      mediaType,
      error: null,
    };
  } catch (err) {
    return {
      main: [],
      popular: [],
      topRated: [],
      trending: [],
      view,
      mediaType,
      error: String(err),
    };
  }
}

export function meta({ data }: Route.MetaArgs) {
  const title = data?.view
    ? `PelixMax - ${data.view.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}`
    : "PelixMax - Discover Movies & TV Shows";
  return [
    { title },
    { name: "description", content: "Discover trending, popular, and top-rated movies and TV shows." },
  ];
}

const viewOptions: { value: ViewMode; label: string }[] = [
  { value: "trending", label: "Trending" },
  { value: "popular", label: "Popular" },
  { value: "top_rated", label: "Top Rated" },
  { value: "upcoming", label: "Upcoming" },
];

const viewTitles: Record<ViewMode, string> = {
  trending: "Trending Today",
  popular: "What's Popular",
  top_rated: "Top Rated",
  upcoming: "Upcoming Releases",
  search: "Search Results",
};

const emptyMessages: Record<ViewMode, string> = {
  trending: "No trending content available",
  popular: "No popular content available",
  top_rated: "No top rated content available",
  upcoming: "No upcoming releases",
  search: "No results found",
};

export default function Home({ loaderData }: Route.ComponentProps) {
  const { main, popular, topRated, trending, view, mediaType, error } = loaderData;
  const { state, setTrending, setPopular, setTopRated, setUpcoming, setViewMode, setMediaType, setError } = useAppState();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    performance.mark("home-render-start");
    setTrending(trending);
    setPopular(popular);
    setTopRated(topRated);
    setUpcoming(main);
    setViewMode(view);
    setMediaType(mediaType);
    if (error) setError(error);
    performance.mark("home-state-sync-end");
    performance.measure("home-state-sync", "home-render-start", "home-state-sync-end");
  }, []);

  const handleViewChange = useCallback((newView: ViewMode) => {
    setSearchParams((prev) => {
      prev.set("view", newView);
      return prev;
    });
  }, [setSearchParams]);

  const handleMediaTypeChange = useCallback((newType: MediaType) => {
    setSearchParams((prev) => {
      prev.set("mediaType", newType);
      return prev;
    });
  }, [setSearchParams]);

  return (
    <div>
      <section className="mb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {viewTitles[view]}
          </h1>

          <div className="flex flex-wrap gap-2">
            <div className="flex rounded-lg border border-gray-300 dark:border-gray-600" role="tablist">
              {viewOptions.map((opt) => (
                <button
                  key={opt.value}
                  role="tab"
                  aria-selected={view === opt.value}
                  onClick={() => handleViewChange(opt.value)}
                  className={`px-3 py-1.5 text-xs font-medium transition-colors first:rounded-l-lg last:rounded-r-lg ${
                    view === opt.value
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {view !== "upcoming" && (
              <div className="flex rounded-lg border border-gray-300 dark:border-gray-600" role="tablist">
                <button
                  role="tab"
                  aria-selected={mediaType === "movie"}
                  onClick={() => handleMediaTypeChange("movie")}
                  className={`rounded-l-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    mediaType === "movie"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  }`}
                >
                  Movies
                </button>
                <button
                  role="tab"
                  aria-selected={mediaType === "tv"}
                  onClick={() => handleMediaTypeChange("tv")}
                  className={`rounded-r-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    mediaType === "tv"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  }`}
                >
                  TV Shows
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {error && (
        <div className="mb-8 rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800 dark:border-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200">
          {error}
        </div>
      )}

      <MovieGrid
        items={main}
        error={error}
        emptyMessage={emptyMessages[view]}
      />

      {view === "trending" && popular.length > 0 && (
        <Section title="What's Popular">
          <MovieGrid items={popular.slice(0, 12)} />
        </Section>
      )}

      {view === "trending" && topRated.length > 0 && (
        <Section title="Top Rated">
          <MovieGrid items={topRated.slice(0, 12)} />
        </Section>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-12">
      <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-gray-100">
        {title}
      </h2>
      {children}
    </section>
  );
}
