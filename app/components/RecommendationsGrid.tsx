import { Link } from "react-router";

const imageBase = "https://image.tmdb.org/t/p";

interface Recommendation {
  id: number;
  media_type: string;
  poster_path: string | null;
  title?: string;
  name?: string;
}

export default function RecommendationsGrid({ items }: { items: Recommendation[] }) {
  return (
    <section className="mt-12">
      <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-gray-100">Recommendations</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {items.map((rec) => {
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
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                />
              ) : (
                <div className="flex aspect-[2/3] items-center justify-center bg-gray-200 dark:bg-gray-700">
                  <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                </div>
              )}
              <p className="truncate p-2 text-xs font-medium text-gray-900 dark:text-gray-100">{recTitle}</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
