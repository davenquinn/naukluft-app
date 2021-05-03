import h from "@macrostrat/hyper";
import { FillPatternDefs } from "../pattern-fill";

const FaciesPatternSwatch = (props) => {
  const { id, size } = props;
  const sz = { width: size, height: size };
  return h("svg", { ...sz }, [
    h(FillPatternDefs, { prefix: "pattern" }),
    h("rect", {
      fill: `url(#pattern-${id})`,
      stroke: "#aaa",
      strokeWidth: 3,
      ...sz,
    }),
  ]);
};

FaciesPatternSwatch.defaultProps = { size: 20 };

const FaciesTract = (props) => {
  const { id, prefix, lithology, children } = props;
  return h("div.facies-tract", [
    h(FaciesPatternSwatch, { id, prefix }),
    h("div.description", [
      h("p.main", children),
      //h.if(lithology != null)("p.lith", lithology)
    ]),
  ]);
};

const SequenceLegend = (props) => {
  const { index, description, children } = props;
  return h("div.sequence-legend", { className: `s${index}` }, [
    h("div.header", [h("h3", `Sequence ${index}`)]),
    h("div.legend-body", children),
  ]);
};

const Legend = (props) => {
  return h("div.legend", [
    h(
      SequenceLegend,
      {
        index: 1,
        description: "Peritidal dolomite and shoreface",
      },
      [
        h(FaciesTract, { id: "p", lithology: "carbonate" }, "Tidal flat"),
        h(FaciesTract, { id: "sub", lithology: "carbonate" }, "Subtidal"),
        h(
          FaciesTract,
          { id: "cc", lithology: "sandstone" },
          "Shoreface and nearshore sand"
        ),
      ]
    ),
    h(
      SequenceLegend,
      {
        index: 2,
        description: "Deeper water",
      },
      [
        h(
          FaciesTract,
          { id: "fc", lithology: "fine siliciclastic" },
          "Basin muds"
        ),
        h(FaciesTract, { id: "rework" }, "Reworking surface"),
      ]
    ),
    h(
      SequenceLegend,
      {
        index: 3,
        description: "Building carbonate ramp",
      },
      [
        h(
          FaciesTract,
          { id: "sh", lithology: "carbonate" },
          "Grainstone shoal and shoreface"
        ),
        h(
          FaciesTract,
          { id: "or", lithology: "intraclast breccia" },
          "Steepened ramp slope"
        ),
        h(
          FaciesTract,
          { id: "mc", lithology: "low-energy grainstone" },
          "Outer ramp"
        ),
      ]
    ),
  ]);
};

export { Legend };
