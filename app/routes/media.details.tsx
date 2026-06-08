import { lazy, Suspense, useEffect, useMemo } from "react";
import type { Route } from "./+types/media.details";
import { getMediaDetails } from "~/lib/tmdb.server";
import type { MediaType, TMDBMovieDetails } from "~/lib/types";
import { useAppState } from "~/lib/state";

const CastSection = lazy(() => import("~/components/CastSection"));
const TrailerPlayer = lazy(() => import("~/components/TrailerPlayer"));
const RecommendationsGrid = lazy(() => import("~/components/RecommendationsGrid"));

type MediaDetailsData = Omit<TMDBMovieDetails, "media_type" | "title" | "release_date"> & {
  media_type: MediaType;
  title?: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
  episode_run_time?: number[];
  number_of_seasons?: number;
};

function getDetailsTitle(media: MediaDetailsData) {
  return media.title ?? media.name ?? "Untitled";
}

function getDetailsDate(media: MediaDetailsData) {
  return media.release_date ?? media.first_air_date ?? "";
}

export async function loader({ params, request }: Route.LoaderArgs): Promise<MediaDetailsData> {
  const mediaId = Number(params.id);
  const mediaType: MediaType = new URL(request.url).pathname.startsWith("/tv/") ? "tv" : "movie";

  if (Number.isNaN(mediaId)) {
    throw new Response("Invalid media ID", { status: 400 });
  }

  try {
    const media = await getMediaDetails(mediaType, mediaId);
    return { ...media, media_type: mediaType } as MediaDetailsData;
  } catch {
    throw new Response("Media not found", { status: 404 });
  }
}

export function meta({ data }: Route.MetaArgs) {
  if (!data) {
    return [{ title: "Not found - PelixMax" }];
  }
  const media = data as MediaDetailsData;
  const title = getDetailsTitle(media);
  return [
    { title: `${title} - PelixMax` },
    { name: "description", content: media.overview?.slice(0, 160) },
    { property: "og:title", content: title },
    { property: "og:description", content: media.overview?.slice(0, 160) },
    ...(media.poster_path
      ? [{ property: "og:image", content: `https://image.tmdb.org/t/p/w500${media.poster_path}` }]
      : []),
  ];
}

const imageBase = "https://image.tmdb.org/t/p";

const formatCurrency = (n: number) =>
  n > 0
    ? new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }).format(n)
    : null;

export default function MediaDetails({ loaderData }: Route.ComponentProps) {
  const media = loaderData as MediaDetailsData;
  const title = getDetailsTitle(media);
  const date = getDetailsDate(media);
  const runtime = media.runtime || media.episode_run_time?.[0];
  const { isFavorite, toggleFavorite } = useAppState();
  const favorited = isFavorite(media as Parameters<typeof isFavorite>[0]);

  useEffect(() => {
    performance.mark("media-detail-render");
  }, []);

  const backdrop = useMemo(() =>
    media.backdrop_path ? `${imageBase}/w1280${media.backdrop_path}` : null,
  [media.backdrop_path]);

  const poster = useMemo(() =>
    media.poster_path ? `${imageBase}/w500${media.poster_path}` : null,
  [media.poster_path]);

  const topCast = useMemo(() => media.credits?.cast?.slice(0, 10) ?? [], [media.credits]);
  const trailer = useMemo(() =>
    media.videos?.results?.find((v) => v.site === "YouTube" && v.type === "Trailer"),
  [media.videos]);
  const recommendations = useMemo(() => media.recommendations?.results?.slice(0, 6) ?? [], [media.recommendations]);

  return (
    <div>
      {backdrop && (
        <div className="relative -mx-4 -mt-6 mb-8 sm:-mx-6 sm:-mt-6 lg:-mx-8 lg:-mt-6">
          <div
            className="h-[30vh] bg-cover bg-center sm:h-[40vh]"
            style={{ backgroundImage: `url(${backdrop})` }}
            role="img"
            aria-label={`${title} backdrop`}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/60 to-transparent" />
          </div>
        </div>
      )}

      <div className={`${backdrop ? "-mt-24 sm:-mt-32 relative z-10" : ""} px-4 sm:px-6 lg:px-8`}>
        <div className="flex flex-col gap-6 md:gap-8 md:flex-row">
          {poster && (
            <div className="shrink-0">
              <img
                src={poster}
                alt={title}
                className="w-40 rounded-xl shadow-lg sm:w-48 md:w-64"
                sizes="(max-width: 768px) 160px, (max-width: 1024px) 192px, 256px"
              />
            </div>
          )}

          <div className="flex-1">
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 sm:text-3xl lg:text-4xl">
                {title}
              </h1>
              <button
                onClick={() => toggleFavorite(media as Parameters<typeof toggleFavorite>[0])}
                className="shrink-0 rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
              >
                <svg
                  className={`h-6 w-6 ${favorited ? "text-red-500" : "text-gray-400"}`}
                  fill={favorited ? "currentColor" : "none"}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </button>
            </div>

            {media.tagline && (
              <p className="mt-2 text-base italic text-gray-500 dark:text-gray-400 sm:mt-3 sm:text-lg">
                {media.tagline}
              </p>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-gray-600 dark:text-gray-400 sm:gap-4 sm:text-sm">
              {date && <span>{date.slice(0, 4)}</span>}
              {runtime && runtime > 0 && <span>{runtime} min</span>}
              {media.genres?.map((g) => (
                <span
                  key={g.id}
                  className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                >
                  {g.name}
                </span>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-1">
                <svg
                  className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="font-bold text-gray-900 dark:text-gray-100">
                  {media.vote_average.toFixed(1)}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
                  ({media.vote_count.toLocaleString()} votes)
                </span>
              </div>

              {media.status && (
                <span className="text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
                  {media.status}
                </span>
              )}
            </div>

            {media.overview && (
              <div className="mt-6">
                <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 sm:text-lg">
                  Overview
                </h2>
                <p className="mt-2 leading-relaxed text-sm text-gray-600 dark:text-gray-300 sm:text-base">
                  {media.overview}
                </p>
              </div>
            )}

            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs sm:gap-x-8 sm:text-sm">
              {"budget" in media && formatCurrency(media.budget) && (
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Budget: </span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {formatCurrency(media.budget)}
                  </span>
                </div>
              )}
              {"revenue" in media && formatCurrency(media.revenue) && (
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Revenue: </span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {formatCurrency(media.revenue)}
                  </span>
                </div>
              )}
              {"number_of_seasons" in media && media.number_of_seasons && (
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Seasons: </span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {media.number_of_seasons}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {topCast.length > 0 && (
          <Suspense fallback={<div className="flex justify-center py-10"><div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" /></div>}>
            <CastSection cast={topCast} />
          </Suspense>
        )}

        {trailer && (
          <Suspense fallback={<div className="flex justify-center py-10"><div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" /></div>}>
            <TrailerPlayer videoKey={trailer.key} title={trailer.name} />
          </Suspense>
        )}

        {recommendations.length > 0 && (
          <Suspense fallback={<div className="flex justify-center py-10"><div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" /></div>}>
            <RecommendationsGrid items={recommendations} />
          </Suspense>
        )}
      </div>
    </div>
  );
}
