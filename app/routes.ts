import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("search", "routes/search.tsx"),
  route("movies/:id", "routes/movies.$id.tsx"),
  route("api/tmdb", "routes/api.tmdb.ts"),
] satisfies RouteConfig;
