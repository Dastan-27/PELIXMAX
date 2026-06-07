import { renderHook, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, beforeEach } from "vitest";
import { AppProvider, useAppState } from "~/lib/state";
import type { TMDBMedia } from "~/lib/types";

const movieA: TMDBMedia = { id: 1, title: "Movie A", overview: "", poster_path: "/a.jpg", backdrop_path: null, release_date: "2024-01-01", vote_average: 8.5, vote_count: 100, genre_ids: [], popularity: 50, media_type: "movie" };
const movieB: TMDBMedia = { id: 2, title: "Movie B", overview: "", poster_path: null, backdrop_path: null, release_date: "2024-02-01", vote_average: 6, vote_count: 50, genre_ids: [], popularity: 80, media_type: "movie" };

function renderWithProvider() {
  return renderHook(() => useAppState(), {
    wrapper: ({ children }: { children: React.ReactNode }) => (
      <AppProvider><MemoryRouter>{children}</MemoryRouter></AppProvider>
    ),
  });
}

describe("Interactive state flow", () => {
  beforeEach(() => window.localStorage.clear());

  it("manages favorites lifecycle, timer, filters, and error state in integration", () => {
    const { result } = renderWithProvider();

    act(() => { result.current.addFavorite(movieA); });
    expect(result.current.isFavorite(movieA)).toBe(true);
    expect(result.current.isFavorite(movieB)).toBe(false);

    act(() => { result.current.toggleFavorite(movieA); });
    expect(result.current.isFavorite(movieA)).toBe(false);

    act(() => { result.current.setFilters({ minRating: 7, sortBy: "rating" }); });
    expect(result.current.state.filters.minRating).toBe(7);

    act(() => { result.current.resetTimer(60); act(() => { result.current.startTimer(60); }); });
    expect(result.current.state.timer.isRunning).toBe(true);
    expect(result.current.state.timer.remainingSeconds).toBe(60);

    act(() => { result.current.pauseTimer(); });
    expect(result.current.state.timer.isRunning).toBe(false);

    act(() => { result.current.setError("API failure"); });
    expect(result.current.state.error).toBe("API failure");

    act(() => { result.current.setError(null); });
    expect(result.current.state.error).toBeNull();
  });
});
