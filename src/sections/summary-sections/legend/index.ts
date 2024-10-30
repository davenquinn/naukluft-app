import { useContext } from "react";
import h from "./index.module.sass";
import classNames from "classnames";
import {
  FaciesContext,
  SymbolLegend,
  FaciesSwatch,
} from "@macrostrat/column-components";

function Facies(props) {
  const { facies } = useContext(FaciesContext);
  const { id, selected, children } = props;

  const d = facies.find((d) => d.id === id);
  if (d == null) {
    return null;
  }
  const style = {};
  if (selected === d.id) {
    style.backgroundColor = d.color;
    style.color = "white";
  }
  const className = classNames({ selected: selected === d.id });

  return h(
    "div.facies",
    {
      key: d.id,
      style,
      className,
    },
    [
      h("div.header", [
        h("p.name", children || d.name),
        h(FaciesSwatch, { facies: d }),
      ]),
    ],
  );
}

function FaciesLegend(props) {
  return h("div.facies-description-inner", [
    h("div.section", [
      h("h4", "Siliciclastic"),
      h(
        Facies,
        { id: "coarse-clastics" },
        "Coarse sandstone and pebble conglomerate",
      ),
      h(
        Facies,
        { id: "shallow-fine-clastics" },
        "Inner shoreface sandstone–siltstone",
      ),
      h(Facies, { id: "fine-clastics" }, "Outer shoreface sandstone–mudstone"),
    ]),
    h("div.section", [
      h("h4", "Carbonate"),
      h(
        Facies,
        { id: "knobbly-stromatolites" },
        "Stromatolite-colonized reworking surface",
      ),
      h(Facies, { id: "carbonate-mudstone" }),
      h(Facies, { id: "intraclast-grainstone" }),
      h(Facies, { id: "hcs-grainstone" }, "Cross-stratified grainstone"),
      h(Facies, { id: "mixed-grainstone" }, "Wavy-bedded heterolithic"),
      h(Facies, { id: "intraclast-breccia" }, "Intraclast breccia"),
      // h('p.explanation', [
      //   h("span.key", "*"),
      //   h("span.description", "Not stratigraphically continuous")
      // ])
    ]),
  ]);
}

function LegendInner() {
  return h("div.legend-inner", [
    h("div.facies-description", [
      h("h2", "Sedimentary facies"),
      h(FaciesLegend),
    ]),
    h("div.symbol-legend-container", [
      h("h2", "Symbology"),
      h(SymbolLegend),
      h(
        "p.note",
        "Triangle bars represent variation in accomodation space at the parasequence set level",
      ),
    ]),
  ]);
}

function Index() {
  return h("div.legend#summary-sections-legend", [
    h("h1", [h("span", "Zebra Nappe"), " stratigraphic model"]),
    h(LegendInner),
  ]);
}

export { Index, FaciesLegend, SymbolLegend };
