import type { TMDBMedia } from "~/lib/types";
import { MovieCard } from "~/components/MovieCard";

interface MovieGridProps {
  items: TMDBMedia[];
  loading?: boolean;
  error?: string | null;
  title?: string;
  emptyMessage?: string;
}

export function MovieGrid({
  items,
  loading = false,
  error = null,
  title,
  emptyMessage = "No results found",
}: MovieGridProps) {
  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-800 dark:bg-red-900/20">
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <section>
        {title && <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-100">{title}</h2>}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[2/3] rounded-xl bg-gray-200 dark:bg-gray-700" />
              <div className="mt-3 space-y-2 p-1">
                <div className="h-4 rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-3 w-2/3 rounded bg-gray-200 dark:bg-gray-700" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <div className="py-12 text-center">
        <svg className="mx-auto mb-4 h-16 w-16 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
        </svg>
        <p className="text-gray-500 dark:text-gray-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <section>
      {title && (
        <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-100">{title}</h2>
      )}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {items.map((media, index) => (
          <MovieCard key={`${media.media_type}-${media.id}`} media={media} index={index} />
        ))}
      </div>
    </section>
  );
}
