import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import vike from "vike/plugin";
import hyperStyles from "@macrostrat/vite-plugin-hyperstyles";
import revisionInfo from "@macrostrat/revision-info-webpack";
import pkg from "./package.json";

import path from "path";

const gitEnv = revisionInfo(pkg, "https://github.com/UW-Macrostrat/web");

export default defineConfig({
  resolve: {
    conditions: ["typescript"],
    alias: {
      "~": path.resolve("./src"),
    },
  },
  plugins: [vike({}), react({}), hyperStyles()],
  build: {
    sourcemap: true,
  },
  define: {
    ...gitEnv,
    COMPILE_DATE: JSON.stringify(new Date().toISOString()),
  },
});
