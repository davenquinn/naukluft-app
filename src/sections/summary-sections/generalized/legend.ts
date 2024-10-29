import {
  ColumnProvider,
  ColumnSVG,
  TriangleBars,
} from "@macrostrat/column-components";
import h from "./legend.module.sass";
import { FaciesLegend, SymbolLegend } from "~/sections/summary-sections/legend";

function Legend(props) {
  return h("div.legend", [
    h("div.facies", [h("h2", "Facies"), h(FaciesLegend)]),
    h("div.symbols", [h("h2", "Symbols"), h(SymbolLegend)]),
    h("div.triangle-bars", [h("h2", ""), h(TriangleBarsLegend)]),
  ]);
}

function TriangleBarsLegend() {
  return h(
    ColumnProvider,
    {
      range: [0, 3],
      divisions: [
        { bottom: 0, surface_type: "sb", surface_order: 0 },
        { bottom: 1, surface_type: "mfs", surface_order: 0 },
        { bottom: 2, surface_type: "sb", surface_order: 0 },
      ],
    },
    [h(ColumnSVG, [h(TriangleBars, { order: 0 })])],
  );
}

export { Legend };
