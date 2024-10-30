import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import vike from "vike/plugin";
import hyperStyles from "@macrostrat/vite-plugin-hyperstyles";

import path from "path";

process.env["VITE_COMPILE_DATE"] = JSON.stringify(new Date().toISOString());

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
});
