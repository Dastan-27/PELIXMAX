import { describe, it, expect } from "vitest";
import type { AppState, TMDBMedia, MediaType, FilterState } from "~/lib/types";

const defaultFilters: FilterState = { minRating: 0, sortBy: "popularity", includeMovies: true, includeTvShows: true };
const defaultTimer = { durationSeconds: 900, remainingSeconds: 900, isRunning: false, lastStartedAt: null };

const movieA: TMDBMedia = { id: 1, title: "Movie A", overview: "", poster_path: "/a.jpg", backdrop_path: null, release_date: "2024-01-01", vote_average: 8, vote_count: 100, genre_ids: [], popularity: 50, media_type: "movie" };
const showA: TMDBMedia = { id: 2, name: "Show A", overview: "", poster_path: null, backdrop_path: null, first_air_date: "2023-01-01", vote_average: 9, vote_count: 200, genre_ids: [], popularity: 90, media_type: "tv" };

function createInitialState(overrides?: Partial<AppState>): AppState {
  return { query: "", searchResults: [], trending: [], popular: [], topRated: [], upcoming: [], selectedMedia: null, favorites: [], filters: { ...defaultFilters }, timer: { ...defaultTimer }, soundEnabled: true, selectedMediaType: "movie", viewMode: "trending", loading: false, error: null, ...overrides };
}

type AppAction =
  | { type: "ADD_FAVORITE"; payload: TMDBMedia }
  | { type: "REMOVE_FAVORITE"; payload: { id: number; mediaType: MediaType } }
  | { type: "TOGGLE_FAVORITE"; payload: TMDBMedia }
  | { type: "SET_FILTERS"; payload: Partial<FilterState> }
  | { type: "RESET_FILTERS" }
  | { type: "START_TIMER"; payload?: number }
  | { type: "PAUSE_TIMER" }
  | { type: "RESET_TIMER"; payload?: number }
  | { type: "TICK_TIMER"; payload?: number }
  | { type: "SET_ERROR"; payload: string | null };

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "ADD_FAVORITE": {
      const key = (m: TMDBMedia) => `${m.media_type}-${m.id}`;
      if (state.favorites.some((f) => key(f) === key(action.payload))) return state;
      return { ...state, favorites: [action.payload, ...state.favorites] };
    }
    case "REMOVE_FAVORITE":
      return { ...state, favorites: state.favorites.filter((f) => !(f.id === action.payload.id && f.media_type === action.payload.mediaType)) };
    case "TOGGLE_FAVORITE": {
      const key = (m: TMDBMedia) => `${m.media_type}-${m.id}`;
      if (state.favorites.some((f) => key(f) === key(action.payload)))
        return { ...state, favorites: state.favorites.filter((f) => key(f) !== key(action.payload)) };
      return { ...state, favorites: [action.payload, ...state.favorites] };
    }
    case "SET_FILTERS": return { ...state, filters: { ...state.filters, ...action.payload } };
    case "RESET_FILTERS": return { ...state, filters: defaultFilters };
    case "START_TIMER": return { ...state, timer: { ...state.timer, isRunning: true, lastStartedAt: new Date().toISOString() } };
    case "PAUSE_TIMER": return { ...state, timer: { ...state.timer, isRunning: false, lastStartedAt: null } };
    case "RESET_TIMER": return { ...state, timer: { ...defaultTimer, durationSeconds: action.payload ?? state.timer.durationSeconds, remainingSeconds: action.payload ?? state.timer.durationSeconds } };
    case "TICK_TIMER": {
      const remaining = Math.max(0, state.timer.remainingSeconds - 1);
      return { ...state, timer: { ...state.timer, remainingSeconds: remaining, isRunning: remaining > 0 } };
    }
    case "SET_ERROR": return { ...state, error: action.payload };
    default: return state;
  }
}

describe("State mutation — favorites, timer, filters", () => {
  it("manages favorites (add unique, prevent duplicate, remove, toggle), timer (start/pause/reset/tick), and filters (update/reset)", () => {
    let state = createInitialState();

    state = appReducer(state, { type: "ADD_FAVORITE", payload: movieA });
    expect(state.favorites).toHaveLength(1);

    state = appReducer(state, { type: "ADD_FAVORITE", payload: movieA });
    expect(state.favorites).toHaveLength(1);

    state = appReducer(state, { type: "ADD_FAVORITE", payload: showA });
    expect(state.favorites).toHaveLength(2);

    state = appReducer(state, { type: "REMOVE_FAVORITE", payload: { id: 1, mediaType: "movie" } });
    expect(state.favorites).toHaveLength(1);
    expect(state.favorites[0].media_type).toBe("tv");

    state = appReducer(state, { type: "TOGGLE_FAVORITE", payload: showA });
    expect(state.favorites).toHaveLength(0);

    state = appReducer(state, { type: "TOGGLE_FAVORITE", payload: movieA });
    expect(state.favorites).toHaveLength(1);

    state = appReducer(state, { type: "START_TIMER" });
    expect(state.timer.isRunning).toBe(true);

    state = appReducer(state, { type: "TICK_TIMER" });
    expect(state.timer.remainingSeconds).toBe(899);

    state = appReducer(state, { type: "RESET_TIMER", payload: 60 });
    expect(state.timer.remainingSeconds).toBe(60);
    expect(state.timer.isRunning).toBe(false);

    state = appReducer(state, { type: "START_TIMER" });
    state = appReducer(state, { type: "PAUSE_TIMER" });
    expect(state.timer.isRunning).toBe(false);

    state = appReducer(state, { type: "SET_FILTERS", payload: { minRating: 7, sortBy: "rating", includeMovies: false } });
    expect(state.filters.minRating).toBe(7);
    expect(state.filters.sortBy).toBe("rating");
    expect(state.filters.includeMovies).toBe(false);

    state = appReducer(state, { type: "RESET_FILTERS" });
    expect(state.filters).toEqual(defaultFilters);

    state = appReducer(state, { type: "SET_ERROR", payload: "Network error" });
    expect(state.error).toBe("Network error");

    state = appReducer(state, { type: "SET_ERROR", payload: null });
    expect(state.error).toBeNull();
  });
});
