import h from "@macrostrat/hyper";
import { FaciesLegend, SymbolLegend } from "~/sections/summary-sections/legend";

const Legend = (props) => {
  return h("div.legend", [
    h("div.facies", [h("h2", "Facies"), h(FaciesLegend)]),
    h("div.symbols", [h("h2", "Symbols"), h(SymbolLegend)]),
  ]);
};

export { Legend };
