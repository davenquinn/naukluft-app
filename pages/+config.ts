import vikeReact from "vike-react/config";
import type { Config } from "vike/types";

// Default config (can be overridden by pages)
export default {
  // Layout,
  // //Head,
  // // <title>
  // meta: {
  //   layout: {
  //     env: { server: true, client: true },
  //   },
  // },
  title: "Naukluft",
  extends: vikeReact,
} satisfies Config;
