import hyper from "@macrostrat/hyper";
import styles from "./main.module.styl";
import { LegendSwatch } from "~/sections/summary-sections/tectonic-pattern-resolver";

const h = hyper.styled(styles);

export function Legend() {
  return h("div#legend.legend", [
    h("div#nnc.legend-area", [
      h("h1", "Tectonic units"),
      h("h2", "Naukluft Nappe Complex"),
      h(Unit, {
        id: "reitoog-nappe",
        className: "minor-unit",
        title: "Rietoog",
        details: "Parautochthonous",
      }),
      h("hr"),
      h(UnitH, { id: "zebra", title: "Zebra" }, [
        h(Unit, {
          id: "zebra-displaced-shale",
          title: "Shale wedge",
          className: "minor-unit",
        }),
        h(Unit, { id: "upper-zebra-nappe", title: "Upper" }),
        h(Unit, { id: "lower-zebra-nappe", title: "Lower" }),
      ]),

      h(UnitH, { id: "dassie", title: "Dassie" }, [
        h(Unit, { id: "eastern-dassie-nappe", title: "Eastern" }),
        h(Unit, { id: "western-dassie-nappe", title: "Western" }),
      ]),
      h(UnitH, { id: "pavian", title: "Pavian" }, [
        h(Unit, { id: "northern-pavian", title: "Northern" }),
        h(UnitH, { id: "southern-pavian", title: "Southern" }, [
          h(Unit, { id: "arbeit-adelt-outlier", title: "Arbeit Adelt" }),
          h(Unit, { id: "bullsport-outlier", title: "Büllsport" }),
        ]),
      ]),
      h(Unit, { id: "kudu-nappe", title: "Kudu" }),
    ]),
    h("div#autochthon.legend-area", [
      h(
        UnitH,
        { id: "nama", className: "bold", title: "Nama Group (foreland basin)" },
        [
          h(Unit, { id: "schwarzrand", title: "Schwarzrand Subgroup" }),
          h(Unit, { id: "zaris", title: "Zaris Subgroup" }),
        ],
      ),
      h(
        UnitH,
        { id: "basement", className: "bold", title: "Pre-Damara basement" },
        [
          h(Unit, { id: "newedam-group", title: "Newedam Group" }),
          h(Unit, { id: "basement", title: "Igneous/Metamorphic" }),
        ],
      ),
    ]),
  ]);
}

function UnitH(props) {
  return h(Unit, { ...props, showSwatch: false });
}

function Unit(props) {
  const { children, className, id, title, details, showSwatch = true } = props;
  return h("div.subunit", { className, id }, [
    h("div.header", [
      h("div.title-block", [
        h("h2", { id }, title),
        h.if(details)("p.details", details),
      ]),
      h.if(showSwatch)(LegendSwatch, {
        id,
        width: 24,
        height: 18,
        className: "legend-swatch",
      }),
    ]),
    children,
  ]);
}
