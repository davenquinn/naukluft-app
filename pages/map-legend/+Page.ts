import h from "./+Page.module.sass";
import { LegendPanel } from "~/map-viewer/legend";

export function Page() {
  return h("div.legend-page", h(LegendPanel));
}
