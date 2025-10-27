import { useContext } from "react";
import styles from "./index.module.sass";
import classNames from "classnames";
import { FaciesContext, FaciesSwatch } from "@macrostrat/column-components";
import { SymbolLegend } from "~/sections/symbol-column";
import hyper from "@macrostrat/hyper";
import {
  ColumnProvider,
  ColumnSVG,
  TriangleBars,
  ColumnAxis,
  useColumn,
} from "@macrostrat/column-components";

const h = hyper.styled(styles);

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
        h("p.facies-name", children || d.name),
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

function KeyValue({ label, value }: { label: string; value: string }) {
  return h("div.key-value", [h("span.key", label), h("span.value", value)]);
}

export function LegendInner({ className, standalone = false }) {
  return h("div.legend-inner", { className }, [
    h("div.facies-description", [h("h2", "Facies"), h(FaciesLegend)]),
    h("div.symbol-legend-container.section", [
      h("h2", "Structures"),
      h(SymbolLegend, { className: "symbol-legend" }),
    ]),
    h("div.sequence-strat.section", [
      h("h2", "Correlations"),
      h.if(standalone)("p.note", [
        "Triangle bars represent higher ",
        "order transgressive–regressive cycles",
      ]),
      h(TriangleBarsLegend),
    ]),
  ]);
}

function LegendFull() {
  return h("div.legend.summary-sections-legend", [
    h("h1", ["Stratigraphic model of the ", h("strong", "Zebra Series")]),
    h("h2.authors", "Daven Quinn"),
    h("p.subtitle", [
      "Preliminary version, accompanying the manuscript ",
      h(
        "em",
        "Tectonostratigraphy of the Zebra Series and the tectonic evolution of the Naukluft Mountains, Namibia",
      ),
    ]),
    h("p.compilation-date", [
      "Compiled on ",
      new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    ]),
    h(LegendInner, { standalone: true }),
  ]);
}

function TriangleBarsLegend() {
  return h(
    ColumnProvider,
    {
      range: [0, 2],
      divisions: [
        { bottom: -1, surface_type: "sb", surface_order: 0 },
        { bottom: 0, surface_type: "mfs", surface_order: 0 },
        { bottom: 1, surface_type: "sb", surface_order: 0 },
        { bottom: 2, surface_type: "mfs", surface_order: 0 },
        { bottom: 3, surface_type: "sb", surface_order: 0 },
      ],
      pixelsPerMeter: 30,
    },
    h(ColumnSVG, { width: 90, padding: 10, paddingH: 2, paddingLeft: 8 }, [
      h(LegendSurfaces, { offsetLeft: 0 }),
      h(TriangleBars, {
        minOrder: 0,
        maxOrder: 0,
        offsetLeft: 0,
        lineWidth: 20,
      }),
      h(SystemsTracts),
    ]),
  );
}

function SystemsTracts() {
  const { scale } = useColumn();
  const tracts = [
    { label: "HST", bottom: 0, top: 1 },
    { label: "TST", bottom: 1, top: 2 },
  ];

  return h(
    "g.systems-tracts",
    tracts.map((tract, index) => {
      const yTop = scale(tract.top);
      const yBottom = scale(tract.bottom);
      const y = (yTop + yBottom) / 2;
      return h("text.systems-tract", { y }, tract.label);
    }),
  );
}

function LegendSurfaces({ offsetLeft = 0 }) {
  const { divisions, scale, range } = useColumn();
  // Draw sequence stratigraphic surfaces, labeling the first two visible ones

  const visibleSurfaces = divisions.filter((d) => {
    return (
      d.bottom >= range[0] && d.bottom <= range[1] && d.surface_type != null
    );
  });

  return h(
    "g.sequence-stratigraphic-surfaces",
    {
      transform: `translate(${offsetLeft} 0)`,
    },
    visibleSurfaces.map((d, index) => {
      const height = scale(d.bottom);
      let className = "";
      let label = null;
      if (d.surface_type === "sb") {
        className = "sequence-boundary";
        label = "sb";
      } else if (d.surface_type === "mfs") {
        className = "maximum-flooding-surface";
        label = "mfs";
      }
      return h(
        "g.surface",
        { key: index, className, transform: `translate(0, ${height})` },
        [
          h("line", {
            x1: 5,
            y1: 0,
            x2: 30,
            y2: 0,
            className,
            strokeWidth: 2,
          }),
          h("text.label", label),
        ],
      );
    }),
  );
}

export { LegendFull, FaciesLegend };
