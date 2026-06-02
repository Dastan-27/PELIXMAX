import { z } from 'zod';

const envSchema = z.object({
  TMDB_BASE_URL: z.string().url().default('https://api.themoviedb.org/3'),
  TMDB_ACCESS_TOKEN: z.string().min(1, "TMDB_ACCESS_TOKEN is required to authenticate with TMDB"),
  TMDB_API_KEY: z.string().optional(), // Optional, as the access token is the recommended way now
});

type EnvSchema = z.infer<typeof envSchema>;

/**
 * Validates and exports the environment variables.
 * In a React Router / Remix Node.js app, process.env is populated at runtime.
 */
export const env = envSchema.parse(process.env);
