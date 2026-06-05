import { Link } from "react-router";
import type { Route } from "./+types/media.details";
import { getMediaDetails } from "~/lib/tmdb.server";
import type { MediaType, TMDBMovieDetails } from "~/lib/types";

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

export default function MediaDetails({ loaderData }: Route.ComponentProps) {
  const media = loaderData as MediaDetailsData;
  const title = getDetailsTitle(media);
  const date = getDetailsDate(media);
  const runtime = media.runtime || media.episode_run_time?.[0];

  const backdrop = media.backdrop_path
    ? `${imageBase}/w1280${media.backdrop_path}`
    : null;
  const poster = media.poster_path
    ? `${imageBase}/w500${media.poster_path}`
    : null;

  const topCast = media.credits?.cast?.slice(0, 10) ?? [];
  const trailer = media.videos?.results?.find(
    (v) => v.site === "YouTube" && v.type === "Trailer"
  );
  const recommendations = media.recommendations?.results?.slice(0, 6) ?? [];

  const formatCurrency = (n: number) =>
    n > 0
      ? new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          maximumFractionDigits: 0,
        }).format(n)
      : null;

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
              />
            </div>
          )}

          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 sm:text-3xl lg:text-4xl">
              {title}
            </h1>

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
          <section className="mt-12">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 sm:text-xl">Cast</h2>
            <div className="mt-4 flex gap-3 overflow-x-auto pb-4 sm:gap-4">
              {topCast.map((person) => (
                <div
                  key={person.id}
                  className="w-20 shrink-0 text-center sm:w-28"
                >
                  {person.profile_path ? (
                    <img
                      src={`${imageBase}/w185${person.profile_path}`}
                      alt={person.name}
                      className="mx-auto h-20 w-20 rounded-full object-cover sm:h-28 sm:w-28"
                      loading="lazy"
                    />
                  ) : (
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 sm:h-28 sm:w-28">
                      <svg
                        className="h-6 w-6 text-gray-400 sm:h-8 sm:w-8"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                        />
                      </svg>
                    </div>
                  )}
                  <p className="mt-2 truncate text-xs font-medium text-gray-900 dark:text-gray-100">
                    {person.name}
                  </p>
                  <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                    {person.character}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {trailer && (
          <section className="mt-12">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 sm:text-xl">
              Trailer
            </h2>
            <div className="mt-4 aspect-video overflow-hidden rounded-xl">
              <iframe
                src={`https://www.youtube.com/embed/${trailer.key}`}
                title={trailer.name}
                className="h-full w-full"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            </div>
          </section>
        )}

        {recommendations.length > 0 && (
          <section className="mt-12">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 sm:text-xl">
              Recommendations
            </h2>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 sm:gap-4">
              {recommendations.map((rec) => {
                const recTitle = "title" in rec ? rec.title : rec.name;
                const recLink = rec.media_type === "tv" ? `/tv/${rec.id}` : `/movies/${rec.id}`;
                return (
                  <Link
                    key={rec.id}
                    to={recLink}
                    className="group rounded-lg overflow-hidden bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md dark:bg-gray-800"
                  >
                    {rec.poster_path ? (
                      <img
                        src={`${imageBase}/w342${rec.poster_path}`}
                        alt={recTitle}
                        className="aspect-[2/3] w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex aspect-[2/3] items-center justify-center bg-gray-200 dark:bg-gray-700">
                        <svg
                          className="h-6 w-6 text-gray-400 sm:h-8 sm:w-8"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z"
                          />
                        </svg>
                      </div>
                    )}
                    <p className="truncate p-2 text-xs font-medium text-gray-900 dark:text-gray-100">
                      {recTitle}
                    </p>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
