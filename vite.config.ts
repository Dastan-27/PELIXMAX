import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import netlifyReactRouter from "@netlify/vite-plugin-react-router";
import netlify from "@netlify/vite-plugin";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [tailwindcss(), reactRouter(), netlifyReactRouter(), netlify()],
  resolve: {
    tsconfigPaths: true,
  },
});
