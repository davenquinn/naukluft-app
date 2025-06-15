import { stratify } from "d3-hierarchy";
import classNames from "classnames";
import { Component, createContext } from "react";
import h from "@macrostrat/hyper";
import { useData } from "vike-react/useData";

var makeNested = function (item) {
  // Recursively callable function to make nested data
  //
  const header = item.append("div").attrs({ class: style.header });

  header.append("h1").text((d) => d.data.name);
  header.append("p").text((d) => d.data.desc);

  const color = (d) => d.data.color || "white";

  const c = item.append("div").attrs({ class: style.children });

  const children = c
    .selectAll("div.child")
    .data(function (d) {
      const vals = d.children || [];
      vals.sort((a, b) => a.data.order < b.data.order);
      return vals.filter((d) => d.data.level != null);
    })
    .enter()
    .append("div")
    .attrs({
      class(d) {
        const ch = d.children || [];
        return classNames("child", d.data.type || "div", {
          nochildren: ch.length === 0,
        });
      },
    });

  if (!children.empty()) {
    return children.call(makeNested);
  }
};

var makeUnit = function (node) {
  const { data, children } = node;
  let { unit_id, name, desc, level, type, is_map_unit, show_in_legend } = data;

  if (desc != null) {
    desc = h("p.desc", desc);
  }

  let swatch = null;
  if (is_map_unit) {
    const backgroundColor = data.color || "white";
    swatch = h("div.swatch", { style: { backgroundColor } });
  }

  console.log(node);
  const parts = [];

  if (show_in_legend) {
    parts.push(
      h("div.header", [swatch, h("h1", name), h("p.desc", desc) || null]),
    );
  }

  if (children != null) {
    children.sort((a, b) => a.data.order < b.data.order);

    const v = children.filter((d) => d.data.level != null).map(makeUnit);

    parts.push(h("div.children", v));
  }

  const className = classNames(unit_id, type, `level-${level}`);
  return h("div.map-unit", { className }, parts);
};

const SwatchDataContext = createContext({ swatches: [] });

const getSwatch = function (id) {
  return null;
};

class Swatch extends Component {
  render() {
    let { color, fgdc_symbol, unit_id } = this.props;
    const style = { border: "1px solid #444", width: 30, height: 20 };
    if (fgdc_symbol != null) {
      color = `url('file://${getSwatch(unit_id)}')`;
    }
    style.background = color;

    return h("div.swatch", { style });
  }
}

class MapUnit extends Component {
  render() {
    return h(SwatchDataContext.Consumer, {}, (swatches) => {
      let desc;
      console.log(swatches);
      let id = this.props.children;
      let name = null;
      if (Array.isArray(id)) {
        [id, name, desc] = id;
      }
      console.log(id, name, desc);
      if (!(swatches.length > 0)) {
        return;
      }
      let swatchData = swatches.find((d) => d.unit_id === id);
      if (swatchData == null) {
        swatchData = {};
      }
      const { name: nameData } = swatchData;
      if (name == null) {
        name = nameData;
      }
      return h("div.unit", [
        h(Swatch, swatchData),
        h("div.right", [h("div.label", name)]),
      ]);
    });
  }
}

const u = (d, name, desc) => h(MapUnit, [d, name, desc]);

class Group extends Component {
  render() {
    return h("div.unit-group", [h("h1", this.props.name), this.props.children]);
  }
}

const g = (n, c) => h(Group, { name: n }, c);

export function MapLegendList() {
  const data = useData();
  return h(_MapLegendList, { data });
}

class _MapLegendList extends Component {
  static initClass() {
    this.defaultProps = {};
  }
  constructor(props) {
    super(props);
    this.createLegend = this.createLegend.bind(this);
    this.state = { data: [] };
  }

  render() {
    const undiv = "Undivided";

    return h(SwatchDataContext.Provider, { value: this.props.data }, [
      h("div#map-units-list", [
        g("Cover", [u("alluvium"), u("colluvium"), u("tufa"), u("dune")]),
        g("Footwall", [
          g("Nama Group", [
            u("urikos"),
            u("urusis"),
            u("houghland", "Houghland Formation"),
            g("Omkyk Formation", [
              u("upper-omkyk-grainstone", "Biostrome (to upper)"),
              u("upper-omkyk", "Upper"),
              u("middle-omkyk"),
              u("middle-omkyk-reef", "Patch reef (to middle)"),
              u("lower-omkyk"),
            ]),
            u("dabis"),
          ]),
        ]),
        g("Naukluft Nappe Complex", [
          g("Zebra Nappe", [
            g("Tafel Formation", [
              u("adler", "Upper"),
              u("zebra-limestone", "Lower"),
              u("tafel", undiv),
            ]),
            g("Onis Formation", [
              u("upper-onis", "Upper"),
              u("middle-onis", "Middle"),
              u("lower-onis", "Lower"),
              u("onis", undiv),
            ]),
            g("Lemoenputs Formation", [
              u("upper-lemoenputs", "Upper"),
              u("lemoenputs-ooid", "Bed B (to middle)"),
              u("middle-lemoenputs", "Middle"),
              u("lemoenputs-a", "Bed A (to lower)"),
              u("lower-lemoenputs", "Lower"),
            ]),
            g("Tsams Formation", [
              u("tsams-c", "Member C"),
              u("tsams-b", "Member B"),
              u("tsams-a", "Member A"),
            ]),
            u("ubisis", "Ubisis Formation"),
            u("neuras", "Neuras Formation"),
          ]),
          g("Dassie Nappe", [
            u("dassie", undiv),
            u("aubslucht", "Shale component"),
          ]),
          g("Pavian Nappe", [
            g("Southern Pavian Nappe", [
              u("bullsport-outlier", "Büllsport outlier"),
              u("arbeit-adelt-outlier", "Arbeit Adelt outlier"),
            ]),
            u("northern-pavian", "Northern Pavian nappe"),
          ]),
          g("Kudu Nappe", [
            u("kudu", undiv),
            u("southern-pavian", "Shale component"),
          ]),
        ]),
        g("Pre-Damara basement", [
          u("newedam-group"),
          u("basement", "Igneous and metamorphic rocks"),
        ]),
      ]),
    ]);
  }

  createLegend() {
    const { data } = this.state;

    data.push({
      unit_id: "root",
      name: "Legend",
      is_map_unit: false,
      show_in_legend: false,
    });

    const f = (key) => (d) => d[key];

    const strat = stratify().id(f("unit_id")).parentId(f("member_of"));

    const rootUnit = strat(data);
    return makeUnit(rootUnit);
  }
}
_MapLegendList.initClass();
