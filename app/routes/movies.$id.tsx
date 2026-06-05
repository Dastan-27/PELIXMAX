import { Link } from "react-router";
import { getMovieDetails } from "~/lib/tmdb.server";
import type { TMDBMovieDetails } from "~/lib/types";

type LoaderArgs = {
  params: {
    id: string;
  };
};

type MetaArgs = {
  data?: TMDBMovieDetails;
};

type ComponentProps = {
  loaderData: TMDBMovieDetails;
};

export async function loader({ params }: LoaderArgs): Promise<TMDBMovieDetails> {
  const movieId = Number(params.id);
  if (Number.isNaN(movieId)) {
    throw new Response("Invalid movie ID", { status: 400 });
  }
  const movie = await getMovieDetails(movieId);
  return movie;
}

export function meta({ data }: MetaArgs) {
  if (!data) {
    return [{ title: "Movie not found - PelixMax" }];
  }
  return [
    { title: `${data.title} - PelixMax` },
    { name: "description", content: data.overview?.slice(0, 160) },
    { property: "og:title", content: data.title },
    { property: "og:description", content: data.overview?.slice(0, 160) },
    ...(data.poster_path
      ? [{ property: "og:image", content: `https://image.tmdb.org/t/p/w500${data.poster_path}` }]
      : []),
  ];
}

const imageBase = "https://image.tmdb.org/t/p";

export default function MovieDetails({ loaderData }: ComponentProps) {
  const movie = loaderData;
  const backdrop = movie.backdrop_path
    ? `${imageBase}/w1280${movie.backdrop_path}`
    : null;
  const poster = movie.poster_path
    ? `${imageBase}/w500${movie.poster_path}`
    : null;

  const topCast = movie.credits?.cast?.slice(0, 10) ?? [];
  const trailer = movie.videos?.results?.find(
    (v) => v.site === "YouTube" && v.type === "Trailer"
  );
  const recommendations = movie.recommendations?.results?.slice(0, 6) ?? [];

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
            className="h-[40vh] bg-cover bg-center"
            style={{ backgroundImage: `url(${backdrop})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/60 to-transparent" />
          </div>
        </div>
      )}

      <div className={`${backdrop ? "-mt-32 relative z-10" : ""}`}>
        <div className="flex flex-col gap-8 md:flex-row">
          {poster && (
            <div className="shrink-0">
              <img
                src={poster}
                alt={movie.title}
                className="w-48 rounded-xl shadow-lg md:w-64"
              />
            </div>
          )}

          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {movie.title}
            </h1>

            {movie.tagline && (
              <p className="mt-1 text-lg italic text-gray-500 dark:text-gray-400">
                {movie.tagline}
              </p>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              {movie.release_date && <span>{movie.release_date}</span>}
              {movie.runtime > 0 && <span>{movie.runtime} min</span>}
              {movie.genres?.map((g) => (
                <span
                  key={g.id}
                  className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                >
                  {g.name}
                </span>
              ))}
            </div>

            <div className="mt-4 flex items-center gap-4">
              <div className="flex items-center gap-1">
                <svg className="h-5 w-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="font-bold text-gray-900 dark:text-gray-100">
                  {movie.vote_average.toFixed(1)}
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  ({movie.vote_count} votes)
                </span>
              </div>

              {movie.status && (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {movie.status}
                </span>
              )}
            </div>

            {movie.overview && (
              <div className="mt-6">
                <h2 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Overview
                </h2>
                <p className="leading-relaxed text-gray-600 dark:text-gray-300">
                  {movie.overview}
                </p>
              </div>
            )}

            <div className="mt-4 flex flex-wrap gap-x-8 gap-y-2 text-sm">
              {formatCurrency(movie.budget) && (
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Budget: </span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {formatCurrency(movie.budget)}
                  </span>
                </div>
              )}
              {formatCurrency(movie.revenue) && (
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Revenue: </span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {formatCurrency(movie.revenue)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {topCast.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-gray-100">Cast</h2>
            <div className="flex gap-4 overflow-x-auto pb-4">
              {topCast.map((person) => (
                <div
                  key={person.id}
                  className="w-28 shrink-0 text-center"
                >
                  {person.profile_path ? (
                    <img
                      src={`${imageBase}/w185${person.profile_path}`}
                      alt={person.name}
                      className="mx-auto h-28 w-28 rounded-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
                      <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                      </svg>
                    </div>
                  )}
                  <p className="mt-2 text-xs font-medium text-gray-900 dark:text-gray-100 truncate">
                    {person.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {person.character}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {trailer && (
          <section className="mt-12">
            <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-gray-100">Trailer</h2>
            <div className="aspect-video overflow-hidden rounded-xl">
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
            <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-gray-100">
              Recommendations
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
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
                        <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
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
