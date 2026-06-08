const imageBase = "https://image.tmdb.org/t/p";

interface CastPerson {
  id: number;
  name: string;
  profile_path: string | null;
  character: string;
}

export default function CastSection({ cast }: { cast: CastPerson[] }) {
  return (
    <section className="mt-12">
      <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-gray-100">Cast</h2>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {cast.map((person) => (
          <div key={person.id} className="w-28 shrink-0 text-center">
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
            <p className="mt-2 text-xs font-medium text-gray-900 dark:text-gray-100 truncate">{person.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{person.character}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
