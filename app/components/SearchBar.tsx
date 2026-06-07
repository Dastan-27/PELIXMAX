import { type FormEvent, useRef, useEffect, useCallback, memo } from "react";
import { useSearch } from "~/hooks/useSearch";
import { useNavigate } from "react-router";

function SearchBarInner() {
  const { query, results, loading, setQuery } = useSearch();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setQuery]);

  const handleSubmit = useCallback((e: FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  }, [query, navigate]);

  const handleSelect = useCallback((id: number, mediaType: string) => {
    setQuery("");
    navigate(`/${mediaType === "tv" ? "tv" : "movies"}/${id}`);
  }, [setQuery, navigate]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  }, [setQuery]);

  const showDropdown = query.trim().length > 0;

  return (
    <div className="relative w-full max-w-md">
      <form onSubmit={handleSubmit} role="search">
        <div className="relative">
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={handleInputChange}
            placeholder="Search movies..."
            aria-label="Search movies and TV shows"
            className="w-full rounded-full border border-gray-300 bg-white/90 px-4 py-2 pl-10 text-sm text-gray-900 placeholder-gray-500 backdrop-blur transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 dark:border-gray-600 dark:bg-gray-800/90 dark:text-gray-100 dark:placeholder-gray-400 dark:focus:border-blue-400"
          />
          <svg
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          {loading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-500" />
            </div>
          )}
        </div>
      </form>

      {showDropdown && results.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 mt-2 w-full rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800"
        >
          <ul className="max-h-96 overflow-y-auto py-2" role="listbox">
            {results.slice(0, 8).map((item) => (
              <li key={item.id} role="option" aria-selected={false}>
                <button
                  type="button"
                  onClick={() => handleSelect(item.id, item.media_type)}
                  className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {item.poster_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w92${item.poster_path}`}
                      alt=""
                      className="h-12 w-8 rounded object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-12 w-8 items-center justify-center rounded bg-gray-200 text-xs text-gray-400 dark:bg-gray-600">
                      N/A
                    </div>
                  )}
                  <div className="flex-1 overflow-hidden">
                    <p className="truncate font-medium text-gray-900 dark:text-gray-100">
                      {"title" in item ? item.title : item.name}
                    </p>
                    <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                      {"release_date" in item ? item.release_date?.slice(0, 4) : item.first_air_date?.slice(0, 4)}
                      {" "}&middot;{" "}
                      <span className="capitalize">{item.media_type}</span>
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-yellow-500">
                    {item.vote_average.toFixed(1)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          {results.length > 0 && (
            <button
              type="button"
              onClick={handleSubmit}
              className="w-full rounded-b-xl border-t border-gray-200 px-4 py-2 text-center text-sm text-blue-600 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-blue-400 dark:hover:bg-gray-700"
            >
              See all {results.length} results
            </button>
          )}
        </div>
      )}

      {showDropdown && !loading && results.length === 0 && (
        <div className="absolute z-50 mt-2 w-full rounded-xl border border-gray-200 bg-white p-4 text-center text-sm text-gray-500 shadow-lg dark:border-gray-700 dark:bg-gray-800">
          No results found
        </div>
      )}
    </div>
  );
}

export const SearchBar = memo(SearchBarInner);
