import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import vike from "vike/plugin";
import hyperStyles from "@macrostrat/vite-plugin-hyperstyles";
import { cjsInterop } from "vite-plugin-cjs-interop";

import path from "path";

export default defineConfig({
  resolve: {
    conditions: ["source"],
    dedupe: [
      "react",
      "react-dom",
      "@macrostrat/ui-components",
      "@macrostrat/column-components",
      "@macrostrat/mapbox-react",
      "@macrostrat/map-interface",
      "@macrostrat/column-views",
      "ui-box",
    ],
    alias: {
      "~": path.resolve("./src"),
    },
  },
  plugins: [
    vike({}),
    react({}),
    hyperStyles(),
    cjsInterop({
      dependencies: [
        "react-images",
        "labella",
        "react-color",
        "mapbox-gl",
        "ui-box",
      ],
    }),
  ],
  define: {
    COMPILE_DATE: JSON.stringify(new Date().toISOString()),
  },
  build: {
    sourcemap: true,
  },
});
