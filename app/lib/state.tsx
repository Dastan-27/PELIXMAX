import { createContext, useContext, useReducer, type ReactNode } from "react";
import type { AppState, AppAction, TMDBMedia, MediaType, ViewMode } from "~/lib/types";

const initialState: AppState = {
  query: "",
  searchResults: [],
  trending: [],
  popular: [],
  topRated: [],
  upcoming: [],
  selectedMediaType: "movie",
  viewMode: "trending",
  loading: false,
  error: null,
};

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
  dispatch: React.Dispatch<AppAction>;
  setQuery: (query: string) => void;
  setSearchResults: (results: TMDBMedia[]) => void;
  setTrending: (results: TMDBMedia[]) => void;
  setPopular: (results: TMDBMedia[]) => void;
  setTopRated: (results: TMDBMedia[]) => void;
  setUpcoming: (results: TMDBMedia[]) => void;
  setMediaType: (mediaType: MediaType) => void;
  setViewMode: (viewMode: ViewMode) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearSearch: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const value: AppContextValue = {
    state,
    dispatch,
    setQuery: (query) => dispatch({ type: "SET_QUERY", payload: query }),
    setSearchResults: (results) => dispatch({ type: "SET_SEARCH_RESULTS", payload: results }),
    setTrending: (results) => dispatch({ type: "SET_TRENDING", payload: results }),
    setPopular: (results) => dispatch({ type: "SET_POPULAR", payload: results }),
    setTopRated: (results) => dispatch({ type: "SET_TOP_RATED", payload: results }),
    setUpcoming: (results) => dispatch({ type: "SET_UPCOMING", payload: results }),
    setMediaType: (mediaType) => dispatch({ type: "SET_MEDIA_TYPE", payload: mediaType }),
    setViewMode: (viewMode) => dispatch({ type: "SET_VIEW_MODE", payload: viewMode }),
    setLoading: (loading) => dispatch({ type: "SET_LOADING", payload: loading }),
    setError: (error) => dispatch({ type: "SET_ERROR", payload: error }),
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
