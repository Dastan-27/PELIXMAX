/* eslint-disable no-console */
const PERFORMANCE_PREFIX = "[PelixMax Perf]";

export function markComponentRender(name: string) {
  if (typeof performance === "undefined") return;
  performance.mark(`${name}-render`);
}

export function measureInteraction(name: string, startMark: string, endMark: string) {
  if (typeof performance === "undefined") return;
  try {
    performance.measure(name, startMark, endMark);
    const entries = performance.getEntriesByName(name, "measure");
    if (entries.length > 0) {
      const duration = entries[entries.length - 1].duration;
      if (duration > 16) {
        console.warn(`${PERFORMANCE_PREFIX} ${name} took ${duration.toFixed(2)}ms (exceeds frame budget)`);
      }
    }
  } catch {
    /* mark not found, skip */
  }
}

export function logMetric(label: string, value: string | number) {
  if (typeof console !== "undefined") {
    console.log(`${PERFORMANCE_PREFIX} ${label}:`, value);
  }
}

export function getLighthouseMetrics() {
  if (typeof performance === "undefined") return null;
  const navEntries = performance.getEntriesByType("navigation");
  if (navEntries.length === 0) return null;
  const nav = navEntries[0] as PerformanceNavigationTiming;
  return {
    ttfb: nav.responseStart - nav.requestStart,
    domInteractive: nav.domInteractive,
    domContentLoaded: nav.domContentLoadedEventEnd,
    loadComplete: nav.loadEventEnd,
    fcp: nav.domContentLoadedEventEnd - nav.responseEnd,
  };
}

declare global {
  interface Window {
    __PELIX_PERF_MARKS__?: Record<string, number>;
  }
}

if (typeof window !== "undefined") {
  window.__PELIX_PERF_MARKS__ = {};
  const originalMark = performance.mark.bind(performance);
  performance.mark = function (markName: string) {
    window.__PELIX_PERF_MARKS__![markName] = performance.now();
    return originalMark(markName);
  };
  document.addEventListener("DOMContentLoaded", () => {
    logMetric("DOM ready", `${performance.now().toFixed(0)}ms`);
  });
  window.addEventListener("load", () => {
    logMetric("Full load", `${performance.now().toFixed(0)}ms`);
    const metrics = getLighthouseMetrics();
    if (metrics) {
      logMetric("TTFB", `${metrics.ttfb.toFixed(0)}ms`);
      logMetric("DOM Interactive", `${metrics.domInteractive.toFixed(0)}ms`);
    }
  });
}
