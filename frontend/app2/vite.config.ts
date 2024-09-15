import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import vike from "vike/plugin";
import path from "path";

export default defineConfig({
  resolve: {
    conditions: ["typescript"],
    alias: {
      "~": path.resolve("../app"),
    },
  },
  plugins: [vike({}), react({})],
});
