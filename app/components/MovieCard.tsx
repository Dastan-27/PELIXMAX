import { memo, useMemo } from "react";
import { Link } from "react-router";
import type { TMDBMedia } from "~/lib/types";

interface MovieCardProps {
  media: TMDBMedia;
  index?: number;
}

const baseImageUrl = "https://image.tmdb.org/t/p/w342";

function MovieCardInner({ media, index = 0 }: MovieCardProps) {
  const title = "title" in media ? media.title : media.name;
  const date = "release_date" in media ? media.release_date : media.first_air_date;
  const year = date?.slice(0, 4) ?? "";
  const linkTo = media.media_type === "tv" ? `/tv/${media.id}` : `/movies/${media.id}`;

  const poster = useMemo(() => media.poster_path ? (
    <img
      src={`${baseImageUrl}${media.poster_path}`}
      alt={title}
      loading={index < 6 ? "eager" : "lazy"}
      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
    />
  ) : (
    <div className="flex h-full items-center justify-center p-4">
      <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
      </svg>
    </div>
  ), [media.poster_path, title, index]);

  return (
    <Link
      to={linkTo}
      className="group relative flex flex-col overflow-hidden rounded-xl bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:bg-gray-800"
    >
      <div className="aspect-[2/3] overflow-hidden bg-gray-200 dark:bg-gray-700">
        {poster}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3">
        <h3 className="line-clamp-2 text-sm font-semibold leading-tight text-gray-900 dark:text-gray-100">
          {title}
        </h3>
        <div className="mt-auto flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>{year}</span>
          <span className="flex items-center gap-1">
            <svg className="h-3.5 w-3.5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            {media.vote_average.toFixed(1)}
          </span>
        </div>
      </div>
    </Link>
  );
}

export const MovieCard = memo(MovieCardInner);
