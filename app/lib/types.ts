export interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  popularity: number;
  media_type: "movie" | "tv";
}

export interface TMDBTVShow {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  popularity: number;
  media_type: "tv";
}

export type TMDBMedia = TMDBMovie | TMDBTVShow;

export interface TMDBPaginatedResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface TMDBGenre {
  id: number;
  name: string;
}

export interface TMDBMovieDetails extends TMDBMovie {
  genres: TMDBGenre[];
  runtime: number;
  status: string;
  tagline: string;
  budget: number;
  revenue: number;
  homepage: string;
  production_companies: { id: number; name: string; logo_path: string | null }[];
  credits: {
    cast: TMDBPerson[];
    crew: TMDBPerson[];
  };
  videos: {
    results: TMDBVideo[];
  };
  recommendations?: { results: TMDBMedia[] };
}

export interface TMDBPerson {
  id: number;
  name: string;
  profile_path: string | null;
  character: string;
  known_for_department: string;
}

export interface TMDBVideo {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
}

export type MediaType = "movie" | "tv";

export type ViewMode = "trending" | "popular" | "top_rated" | "upcoming" | "search";

export type SortMode = "popularity" | "rating" | "date" | "title";

export interface FilterState {
  minRating: number;
  sortBy: SortMode;
  includeMovies: boolean;
  includeTvShows: boolean;
}

export interface TimerState {
  durationSeconds: number;
  remainingSeconds: number;
  isRunning: boolean;
  lastStartedAt: string | null;
}

export interface AppState {
  query: string;
  searchResults: TMDBMedia[];
  trending: TMDBMedia[];
  popular: TMDBMedia[];
  topRated: TMDBMedia[];
  upcoming: TMDBMedia[];
  selectedMedia: TMDBMedia | null;
  favorites: TMDBMedia[];
  filters: FilterState;
  timer: TimerState;
  soundEnabled: boolean;
  selectedMediaType: MediaType;
  viewMode: ViewMode;
  loading: boolean;
  error: string | null;
}

export type AppAction =
  | { type: "SET_QUERY"; payload: string }
  | { type: "SET_SEARCH_RESULTS"; payload: TMDBMedia[] }
  | { type: "SET_TRENDING"; payload: TMDBMedia[] }
  | { type: "SET_POPULAR"; payload: TMDBMedia[] }
  | { type: "SET_TOP_RATED"; payload: TMDBMedia[] }
  | { type: "SET_UPCOMING"; payload: TMDBMedia[] }
  | { type: "SET_SELECTED_MEDIA"; payload: TMDBMedia | null }
  | { type: "ADD_FAVORITE"; payload: TMDBMedia }
  | { type: "REMOVE_FAVORITE"; payload: { id: number; mediaType: MediaType } }
  | { type: "TOGGLE_FAVORITE"; payload: TMDBMedia }
  | { type: "SET_FILTERS"; payload: Partial<FilterState> }
  | { type: "RESET_FILTERS" }
  | { type: "START_TIMER"; payload?: number }
  | { type: "PAUSE_TIMER" }
  | { type: "RESET_TIMER"; payload?: number }
  | { type: "TICK_TIMER"; payload?: number }
  | { type: "SET_SOUND_ENABLED"; payload: boolean }
  | { type: "SET_MEDIA_TYPE"; payload: MediaType }
  | { type: "SET_VIEW_MODE"; payload: ViewMode }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "CLEAR_SEARCH" };
