import vikeReact from "vike-react/config";
import type { Config } from "vike/types";

// Default config (can be overridden by pages)
export default {
  title: "Naukluft",
  passToClient: ["runtimeEnv"],
  extends: vikeReact,
} satisfies Config;
