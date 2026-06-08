import { describe, it, expect } from "vitest";
import { appReducer } from "../../app/lib/state";
import type { AppState, TMDBMedia } from "../../app/lib/types";

const mockMovie: TMDBMedia = {
  id: 1,
  media_type: "movie",
  title: "Test Movie",
  overview: "A test movie",
  poster_path: null,
  backdrop_path: null,
  release_date: "2024-01-01",
  vote_average: 7.5,
  vote_count: 100,
  genre_ids: [],
  popularity: 50,
};

const mockTV: TMDBMedia = {
  id: 2,
  media_type: "tv",
  name: "Test Show",
  overview: "A test show",
  poster_path: null,
  backdrop_path: null,
  first_air_date: "2024-01-01",
  vote_average: 8.0,
  vote_count: 200,
  genre_ids: [],
  popularity: 80,
};

function createInitialState(overrides?: Partial<AppState>): AppState {
  return {
    query: "",
    searchResults: [],
    trending: [],
    popular: [],
    topRated: [],
    upcoming: [],
    selectedMedia: null,
    favorites: [],
    filters: { minRating: 0, sortBy: "popularity", includeMovies: true, includeTvShows: true },
    timer: { durationSeconds: 900, remainingSeconds: 900, isRunning: false, lastStartedAt: null },
    soundEnabled: true,
    selectedMediaType: "movie",
    viewMode: "trending",
    loading: false,
    error: null,
    ...overrides,
  };
}

describe("appReducer", () => {
  it("should add a favorite", () => {
    const state = createInitialState();
    const next = appReducer(state, { type: "ADD_FAVORITE", payload: mockMovie });
    expect(next.favorites).toHaveLength(1);
    expect(next.favorites[0].id).toBe(1);
  });

  it("should not duplicate favorites", () => {
    const state = createInitialState({ favorites: [mockMovie] });
    const next = appReducer(state, { type: "ADD_FAVORITE", payload: mockMovie });
    expect(next.favorites).toHaveLength(1);
  });

  it("should toggle favorite on and off", () => {
    const state = createInitialState();
    const added = appReducer(state, { type: "TOGGLE_FAVORITE", payload: mockMovie });
    expect(added.favorites).toHaveLength(1);

    const removed = appReducer(added, { type: "TOGGLE_FAVORITE", payload: mockMovie });
    expect(removed.favorites).toHaveLength(0);
  });

  it("should remove a favorite by id and mediaType", () => {
    const state = createInitialState({ favorites: [mockMovie, mockTV] });
    const next = appReducer(state, { type: "REMOVE_FAVORITE", payload: { id: 1, mediaType: "movie" } });
    expect(next.favorites).toHaveLength(1);
    expect(next.favorites[0].id).toBe(2);
  });

  it("should apply filters", () => {
    const state = createInitialState();
    const next = appReducer(state, { type: "SET_FILTERS", payload: { minRating: 5, sortBy: "rating" } });
    expect(next.filters.minRating).toBe(5);
    expect(next.filters.sortBy).toBe("rating");
  });

  it("should reset filters to defaults", () => {
    const state = createInitialState({ filters: { minRating: 5, sortBy: "rating", includeMovies: false, includeTvShows: false } });
    const next = appReducer(state, { type: "RESET_FILTERS" });
    expect(next.filters.minRating).toBe(0);
    expect(next.filters.sortBy).toBe("popularity");
    expect(next.filters.includeMovies).toBe(true);
    expect(next.filters.includeTvShows).toBe(true);
  });

  it("should start and pause the timer", () => {
    const state = createInitialState();
    const started = appReducer(state, { type: "START_TIMER" });
    expect(started.timer.isRunning).toBe(true);
    expect(started.timer.remainingSeconds).toBe(900);

    const paused = appReducer(started, { type: "PAUSE_TIMER" });
    expect(paused.timer.isRunning).toBe(false);
  });

  it("should reset the timer", () => {
    const state = createInitialState({ timer: { durationSeconds: 900, remainingSeconds: 300, isRunning: true, lastStartedAt: "2024-01-01T00:00:00Z" } });
    const next = appReducer(state, { type: "RESET_TIMER" });
    expect(next.timer.remainingSeconds).toBe(900);
    expect(next.timer.isRunning).toBe(false);
    expect(next.timer.lastStartedAt).toBeNull();
  });

  it("should tick the timer down", () => {
    const state = createInitialState({ timer: { durationSeconds: 900, remainingSeconds: 10, isRunning: true, lastStartedAt: "2024-01-01T00:00:00Z" } });
    const next = appReducer(state, { type: "TICK_TIMER" });
    expect(next.timer.remainingSeconds).toBe(9);
  });

  it("should stop the timer when it reaches zero", () => {
    const state = createInitialState({ timer: { durationSeconds: 900, remainingSeconds: 1, isRunning: true, lastStartedAt: "2024-01-01T00:00:00Z" } });
    const next = appReducer(state, { type: "TICK_TIMER" });
    expect(next.timer.remainingSeconds).toBe(0);
    expect(next.timer.isRunning).toBe(false);
    expect(next.timer.lastStartedAt).toBeNull();
  });

  it("should toggle sound", () => {
    const state = createInitialState();
    const next = appReducer(state, { type: "SET_SOUND_ENABLED", payload: false });
    expect(next.soundEnabled).toBe(false);
  });

  it("should set error and play sound (sound not tested in reducer)", () => {
    const state = createInitialState();
    const next = appReducer(state, { type: "SET_ERROR", payload: "Something went wrong" });
    expect(next.error).toBe("Something went wrong");
  });
});
