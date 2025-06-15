import h from "@macrostrat/hyper";
import { MapLegendList } from "./inner";

export function LegendPanel() {
  return h("div#map-legend", { key: "legend" }, [
    h("div.legend-inner", {}, [
      h("div.title-block", [
        h("h1", "Geologic map of the southern Naukluft Mountains"),
        h("div.admonition", [
          h(
            "p",
            "Fault ticks, fold axes, bedding orientations, and unit labels are not rendered",
          ),
        ]),
      ]),
      h(MapLegendList),
    ]),
  ]);
}
