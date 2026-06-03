import { env } from "~/env.server";
import type {
  TMDBMedia,
  TMDBMovieDetails,
  TMDBPaginatedResponse,
  TMDBGenre,
} from "~/lib/types";

const BASE_URL = env.TMDB_BASE_URL;
const OPTIONS: RequestInit = {
  headers: {
    Authorization: `Bearer ${env.TMDB_ACCESS_TOKEN}`,
    "Content-Type": "application/json",
  },
};

async function fetchFromTMDB<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(`${BASE_URL}${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
  }
  const response = await fetch(url.toString(), OPTIONS);
  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

export async function getTrending(
  mediaType: "movie" | "tv" = "movie",
  timeWindow: "day" | "week" = "day"
): Promise<TMDBMedia[]> {
  const data = await fetchFromTMDB<TMDBPaginatedResponse<Record<string, unknown>>>(
    `/trending/${mediaType}/${timeWindow}`
  );
  return data.results.map((item) => ({ ...item, media_type: mediaType })) as TMDBMedia[];
}

export async function getPopular(mediaType: "movie" | "tv" = "movie"): Promise<TMDBMedia[]> {
  const data = await fetchFromTMDB<TMDBPaginatedResponse<Record<string, unknown>>>(
    `/${mediaType}/popular`,
    { language: "en-US", page: "1" }
  );
  return data.results.map((item) => ({ ...item, media_type: mediaType })) as TMDBMedia[];
}

export async function getTopRated(mediaType: "movie" | "tv" = "movie"): Promise<TMDBMedia[]> {
  const data = await fetchFromTMDB<TMDBPaginatedResponse<Record<string, unknown>>>(
    `/${mediaType}/top_rated`,
    { language: "en-US", page: "1" }
  );
  return data.results.map((item) => ({ ...item, media_type: mediaType })) as TMDBMedia[];
}

export async function getUpcoming(): Promise<TMDBMedia[]> {
  const data = await fetchFromTMDB<TMDBPaginatedResponse<Record<string, unknown>>>(
    "/movie/upcoming",
    { language: "en-US", page: "1" }
  );
  return data.results.map((item) => ({ ...item, media_type: "movie" })) as TMDBMedia[];
}

export async function searchMedia(
  query: string,
  mediaType: "movie" | "tv" = "movie"
): Promise<TMDBMedia[]> {
  const data = await fetchFromTMDB<TMDBPaginatedResponse<Record<string, unknown>>>(
    `/search/${mediaType}`,
    { query, language: "en-US", page: "1" }
  );
  return data.results.map((item) => ({ ...item, media_type: mediaType })) as TMDBMedia[];
}

export async function getMovieDetails(movieId: number): Promise<TMDBMovieDetails> {
  return fetchFromTMDB<TMDBMovieDetails>(`/movie/${movieId}`, {
    language: "en-US",
    append_to_response: "credits,videos,recommendations",
  });
}

export async function getGenres(mediaType: "movie" | "tv" = "movie"): Promise<TMDBGenre[]> {
  const data = await fetchFromTMDB<{ genres: TMDBGenre[] }>(
    `/genre/${mediaType}/list`,
    { language: "en-US" }
  );
  return data.genres;
}
