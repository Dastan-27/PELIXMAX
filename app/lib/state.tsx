import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type Dispatch,
  type ReactNode,
} from "react";
import type {
  AppState,
  AppAction,
  FilterState,
  MediaType,
  TMDBMedia,
  TimerState,
  ViewMode,
} from "~/lib/types";

const STORAGE_KEY = "pelixmax:app-state:v1";
const DEFAULT_TIMER_SECONDS = 15 * 60;

const defaultFilters: FilterState = {
  minRating: 0,
  sortBy: "popularity",
  includeMovies: true,
  includeTvShows: true,
};

const defaultTimer: TimerState = {
  durationSeconds: DEFAULT_TIMER_SECONDS,
  remainingSeconds: DEFAULT_TIMER_SECONDS,
  isRunning: false,
  lastStartedAt: null,
};

const initialState: AppState = {
  query: "",
  searchResults: [],
  trending: [],
  popular: [],
  topRated: [],
  upcoming: [],
  selectedMedia: null,
  favorites: [],
  filters: defaultFilters,
  timer: defaultTimer,
  soundEnabled: true,
  selectedMediaType: "movie",
  viewMode: "trending",
  loading: false,
  error: null,
};

type PersistedState = Pick<
  AppState,
  "query" | "selectedMedia" | "favorites" | "filters" | "timer" | "soundEnabled" | "selectedMediaType" | "viewMode"
>;

function isBrowser() {
  return typeof window !== "undefined";
}

function getMediaTitle(media: TMDBMedia) {
  return "title" in media ? media.title : media.name;
}

function getMediaDate(media: TMDBMedia) {
  return "release_date" in media ? media.release_date : media.first_air_date;
}

function getMediaKey(media: TMDBMedia) {
  return `${media.media_type}-${media.id}`;
}

function loadPersistedState(): AppState {
  if (!isBrowser()) return initialState;

  try {
    const rawValue = window.localStorage.getItem(STORAGE_KEY);
    if (!rawValue) return initialState;

    const parsed = JSON.parse(rawValue) as Partial<PersistedState>;
    return {
      ...initialState,
      query: typeof parsed.query === "string" ? parsed.query : initialState.query,
      selectedMedia: parsed.selectedMedia ?? initialState.selectedMedia,
      favorites: Array.isArray(parsed.favorites) ? parsed.favorites : initialState.favorites,
      filters: { ...defaultFilters, ...(parsed.filters ?? {}) },
      timer: { ...defaultTimer, ...(parsed.timer ?? {}), isRunning: false, lastStartedAt: null },
      soundEnabled: typeof parsed.soundEnabled === "boolean" ? parsed.soundEnabled : initialState.soundEnabled,
      selectedMediaType: parsed.selectedMediaType ?? initialState.selectedMediaType,
      viewMode: parsed.viewMode ?? initialState.viewMode,
    };
  } catch {
    return initialState;
  }
}

function persistState(state: AppState) {
  if (!isBrowser()) return;

  const persisted: PersistedState = {
    query: state.query,
    selectedMedia: state.selectedMedia,
    favorites: state.favorites,
    filters: state.filters,
    timer: { ...state.timer, isRunning: false, lastStartedAt: null },
    soundEnabled: state.soundEnabled,
    selectedMediaType: state.selectedMediaType,
    viewMode: state.viewMode,
  };

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));
}

function playAppSound(kind: "success" | "warning" | "error", enabled: boolean) {
  if (!enabled || !isBrowser()) return;

  const AudioContextConstructor =
    window.AudioContext ??
    (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextConstructor) return;

  try {
    const audioContext = new AudioContextConstructor();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const frequency = kind === "success" ? 660 : kind === "warning" ? 440 : 220;

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.08, audioContext.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.22);

    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.24);
  } catch {
    // Browsers can block audio until the first explicit user interaction.
  }
}

function hasFavorite(favorites: TMDBMedia[], media: TMDBMedia) {
  return favorites.some((item) => getMediaKey(item) === getMediaKey(media));
}

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SET_QUERY":
      return { ...state, query: action.payload };
    case "SET_SEARCH_RESULTS":
      return { ...state, searchResults: action.payload };
    case "SET_TRENDING":
      return { ...state, trending: action.payload };
    case "SET_POPULAR":
      return { ...state, popular: action.payload };
    case "SET_TOP_RATED":
      return { ...state, topRated: action.payload };
    case "SET_UPCOMING":
      return { ...state, upcoming: action.payload };
    case "SET_SELECTED_MEDIA":
      return { ...state, selectedMedia: action.payload };
    case "ADD_FAVORITE":
      if (hasFavorite(state.favorites, action.payload)) return state;
      return { ...state, favorites: [action.payload, ...state.favorites] };
    case "REMOVE_FAVORITE":
      return {
        ...state,
        favorites: state.favorites.filter(
          (item) => !(item.id === action.payload.id && item.media_type === action.payload.mediaType),
        ),
      };
    case "TOGGLE_FAVORITE":
      if (hasFavorite(state.favorites, action.payload)) {
        return {
          ...state,
          favorites: state.favorites.filter((item) => getMediaKey(item) !== getMediaKey(action.payload)),
        };
      }
      return { ...state, favorites: [action.payload, ...state.favorites] };
    case "SET_FILTERS":
      return { ...state, filters: { ...state.filters, ...action.payload } };
    case "RESET_FILTERS":
      return { ...state, filters: defaultFilters };
    case "START_TIMER": {
      const durationSeconds = action.payload ?? state.timer.durationSeconds;
      const remainingSeconds = state.timer.remainingSeconds > 0 ? state.timer.remainingSeconds : durationSeconds;
      return {
        ...state,
        timer: {
          durationSeconds,
          remainingSeconds,
          isRunning: true,
          lastStartedAt: new Date().toISOString(),
        },
      };
    }
    case "PAUSE_TIMER":
      return { ...state, timer: { ...state.timer, isRunning: false, lastStartedAt: null } };
    case "RESET_TIMER": {
      const durationSeconds = action.payload ?? state.timer.durationSeconds;
      return {
        ...state,
        timer: {
          durationSeconds,
          remainingSeconds: durationSeconds,
          isRunning: false,
          lastStartedAt: null,
        },
      };
    }
    case "TICK_TIMER": {
      const remainingSeconds = Math.max(0, action.payload ?? state.timer.remainingSeconds - 1);
      return {
        ...state,
        timer: {
          ...state.timer,
          remainingSeconds,
          isRunning: remainingSeconds > 0 && state.timer.isRunning,
          lastStartedAt: remainingSeconds > 0 ? state.timer.lastStartedAt : null,
        },
      };
    }
    case "SET_SOUND_ENABLED":
      return { ...state, soundEnabled: action.payload };
    case "SET_MEDIA_TYPE":
      return { ...state, selectedMediaType: action.payload };
    case "SET_VIEW_MODE":
      return { ...state, viewMode: action.payload };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    case "CLEAR_SEARCH":
      return { ...state, query: "", searchResults: [] };
    default:
      return state;
  }
}

interface AppContextValue {
  state: AppState;
  currentItems: TMDBMedia[];
  filteredItems: TMDBMedia[];
  isFavorite: (media: TMDBMedia) => boolean;
  dispatch: Dispatch<AppAction>;
  setQuery: (query: string) => void;
  setSearchResults: (results: TMDBMedia[]) => void;
  setTrending: (results: TMDBMedia[]) => void;
  setPopular: (results: TMDBMedia[]) => void;
  setTopRated: (results: TMDBMedia[]) => void;
  setUpcoming: (results: TMDBMedia[]) => void;
  setSelectedMedia: (media: TMDBMedia | null) => void;
  addFavorite: (media: TMDBMedia) => void;
  removeFavorite: (id: number, mediaType: MediaType) => void;
  toggleFavorite: (media: TMDBMedia) => void;
  setFilters: (filters: Partial<FilterState>) => void;
  resetFilters: () => void;
  startTimer: (durationSeconds?: number) => void;
  pauseTimer: () => void;
  resetTimer: (durationSeconds?: number) => void;
  setSoundEnabled: (enabled: boolean) => void;
  playSound: (kind: "success" | "warning" | "error") => void;
  setMediaType: (mediaType: MediaType) => void;
  setViewMode: (viewMode: ViewMode) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearSearch: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState, loadPersistedState);
  const previousRemainingSeconds = useRef(state.timer.remainingSeconds);

  useEffect(() => {
    persistState(state);
  }, [
    state.query,
    state.selectedMedia,
    state.favorites,
    state.filters,
    state.timer,
    state.soundEnabled,
    state.selectedMediaType,
    state.viewMode,
  ]);

  useEffect(() => {
    if (!state.timer.isRunning) return;

    const intervalId = window.setInterval(() => {
      dispatch({ type: "TICK_TIMER" });
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [state.timer.isRunning]);

  useEffect(() => {
    if (previousRemainingSeconds.current > 0 && state.timer.remainingSeconds === 0) {
      playAppSound("warning", state.soundEnabled);
    }
    previousRemainingSeconds.current = state.timer.remainingSeconds;
  }, [state.soundEnabled, state.timer.remainingSeconds]);

  const currentItems = useMemo(() => {
    const collections: Record<ViewMode, TMDBMedia[]> = {
      trending: state.trending,
      popular: state.popular,
      top_rated: state.topRated,
      upcoming: state.upcoming,
      search: state.searchResults,
    };
    return collections[state.viewMode];
  }, [state.popular, state.searchResults, state.topRated, state.trending, state.upcoming, state.viewMode]);

  const filteredItems = useMemo(() => {
    return [...currentItems]
      .filter((item) => {
        if (item.vote_average < state.filters.minRating) return false;
        if (item.media_type === "movie" && !state.filters.includeMovies) return false;
        if (item.media_type === "tv" && !state.filters.includeTvShows) return false;
        return true;
      })
      .sort((a, b) => {
        if (state.filters.sortBy === "rating") return b.vote_average - a.vote_average;
        if (state.filters.sortBy === "date") return getMediaDate(b).localeCompare(getMediaDate(a));
        if (state.filters.sortBy === "title") return getMediaTitle(a).localeCompare(getMediaTitle(b));
        return b.popularity - a.popularity;
      });
  }, [currentItems, state.filters]);

  const value: AppContextValue = {
    state,
    currentItems,
    filteredItems,
    isFavorite: (media) => hasFavorite(state.favorites, media),
    dispatch,
    setQuery: (query) => dispatch({ type: "SET_QUERY", payload: query }),
    setSearchResults: (results) => dispatch({ type: "SET_SEARCH_RESULTS", payload: results }),
    setTrending: (results) => dispatch({ type: "SET_TRENDING", payload: results }),
    setPopular: (results) => dispatch({ type: "SET_POPULAR", payload: results }),
    setTopRated: (results) => dispatch({ type: "SET_TOP_RATED", payload: results }),
    setUpcoming: (results) => dispatch({ type: "SET_UPCOMING", payload: results }),
    setSelectedMedia: (media) => dispatch({ type: "SET_SELECTED_MEDIA", payload: media }),
    addFavorite: (media) => {
      dispatch({ type: "ADD_FAVORITE", payload: media });
      playAppSound("success", state.soundEnabled);
    },
    removeFavorite: (id, mediaType) => {
      dispatch({ type: "REMOVE_FAVORITE", payload: { id, mediaType } });
      playAppSound("warning", state.soundEnabled);
    },
    toggleFavorite: (media) => {
      dispatch({ type: "TOGGLE_FAVORITE", payload: media });
      playAppSound(hasFavorite(state.favorites, media) ? "warning" : "success", state.soundEnabled);
    },
    setFilters: (filters) => dispatch({ type: "SET_FILTERS", payload: filters }),
    resetFilters: () => dispatch({ type: "RESET_FILTERS" }),
    startTimer: (durationSeconds) => dispatch({ type: "START_TIMER", payload: durationSeconds }),
    pauseTimer: () => dispatch({ type: "PAUSE_TIMER" }),
    resetTimer: (durationSeconds) => dispatch({ type: "RESET_TIMER", payload: durationSeconds }),
    setSoundEnabled: (enabled) => dispatch({ type: "SET_SOUND_ENABLED", payload: enabled }),
    playSound: (kind) => playAppSound(kind, state.soundEnabled),
    setMediaType: (mediaType) => dispatch({ type: "SET_MEDIA_TYPE", payload: mediaType }),
    setViewMode: (viewMode) => dispatch({ type: "SET_VIEW_MODE", payload: viewMode }),
    setLoading: (loading) => dispatch({ type: "SET_LOADING", payload: loading }),
    setError: (error) => {
      dispatch({ type: "SET_ERROR", payload: error });
      if (error) playAppSound("error", state.soundEnabled);
    },
    clearSearch: () => dispatch({ type: "CLEAR_SEARCH" }),
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppState(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppState must be used within an AppProvider");
  }
  return context;
}
