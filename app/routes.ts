import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("search", "routes/search.tsx"),
  route("movies/:id", "routes/media.details.tsx", { id: "routes/movie.details" }),
  route("tv/:id", "routes/media.details.tsx", { id: "routes/tv.details" }),
  route("api/tmdb", "routes/api.tmdb.ts"),
] satisfies RouteConfig;
