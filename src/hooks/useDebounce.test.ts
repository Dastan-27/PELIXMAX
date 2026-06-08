import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDebounce } from "~/hooks/useDebounce";

describe("Debounce logic", () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it("delays value updates and resets timer on rapid changes", () => {
    const { result, rerender } = renderHook(({ value, delay }: { value: string; delay: number }) => useDebounce(value, delay), { initialProps: { value: "", delay: 300 } });

    rerender({ value: "a", delay: 300 });
    act(() => vi.advanceTimersByTime(100));
    expect(result.current).toBe("");

    rerender({ value: "ab", delay: 300 });
    act(() => vi.advanceTimersByTime(100));
    expect(result.current).toBe("");

    rerender({ value: "abc", delay: 300 });
    act(() => vi.advanceTimersByTime(300));
    expect(result.current).toBe("abc");
  });
});
