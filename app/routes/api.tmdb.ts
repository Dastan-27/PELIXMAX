import type { Route } from "./+types/api.tmdb";
import { searchMedia, getTrending } from "~/lib/tmdb.server";

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const action = url.searchParams.get("action");
  const query = url.searchParams.get("query") ?? "";
  const mediaType = (url.searchParams.get("mediaType") ?? "movie") as "movie" | "tv";

  try {
    if (action === "search" && query.trim()) {
      const results = await searchMedia(query.trim(), mediaType);
      return { ok: true, results };
    }

    if (action === "trending") {
      const results = await getTrending(mediaType, "day");
      return { ok: true, results };
    }

    return { ok: false, error: "Invalid action" };
  } catch (error) {
    return { ok: false, error: String(error) };
  }
}
