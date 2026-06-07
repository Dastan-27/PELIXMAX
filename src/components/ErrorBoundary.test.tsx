import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ErrorBoundary } from "~/root";

function routeError(status: number, statusText?: string) {
  return { status, statusText: statusText ?? "", data: null, internal: true };
}

describe("Error screen handling", () => {
  it("renders 404 and generic route error messages", () => {
    render(<ErrorBoundary error={routeError(404, "Not Found")} />);
    expect(screen.getByText("404")).toBeInTheDocument();
    expect(screen.getByText("The requested page could not be found.")).toBeInTheDocument();
  });
});
