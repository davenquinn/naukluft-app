/**
 * h = require 'virtual-dom/h'
 * s = require 'virtual-hyperscript-svg'
 * createElement = require 'virtual-dom/create-element'
 *
 * createLegend = (data, fillFunc)->
 *
 *   findUnit = (id)->
 *     value = data.find (v)->v.unit_id == id
 *     return value if value?
 *     data.find (v)->v.tectonic_unit == id
 *
 *   unit = (id, opts, children)->
 *     if not children?
 *       children = opts
 *       opts = {}
 *     if Array.isArray children
 *       [name, rest...] = children
 *     else
 *       name = children
 *       rest = []
 *     value = findUnit id
 *     sz = {width: 30, height: 20}
 *     h "div.subunit", opts, [
 *       h 'div.header', [
 *         h "h2",{id}, name
 *         h 'div.swatch', [
 *           s 'svg.swatch', [
 *             s 'rect', {fill: fillFunc(value), sz...}
 *           ]
 *         ]
 *       ]
 *       rest...
 *
 *     ]
 *
 *   unitH = (id,opts,children)->
 *     if not children?
 *       children = opts
 *       opts = {}
 *     [name, rest...] = children
 *     h "div.subunit", opts, [
 *       h "h2",{id}, name
 *       rest...
 *     ]
 *
 *   tree = h 'div#legend', [
 *     h 'div#nnc', [
 *       h 'h1', 'Naukluft nappe tectonic units'
 *       unit 'kudu', [
 *         'Kudu'
 *       ]
 *       unitH 'pavian', [
 *         'Pavian'
 *         unit 'northern-pavian', 'Northern'
 *         unitH 'southern-pavian', [
 *           'Southern'
 *           unit 'arbeit-adelt-outlier', 'Arbeit Adelt facies'
 *           unit 'bullsport-outlier', 'Büllsport facies'
 *         ]
 *       ]
 *       unitH 'dassie', [
 *         'Dassie'
 *         unit 'eastern-dassie-nappe', 'Eastern'
 *         unit 'western-dassie-nappe', 'Western'
 *       ]
 *       unitH 'zebra', [
 *         'Zebra'
 *         unit 'upper-zebra-nappe', 'Upper'
 *         unit 'lower-zebra-nappe', 'Lower'
 *         unit 'zebra-displaced-shale', 'Intercalated shale'
 *       ]
 *       h 'div.hr.parauthocthon'
 *       h 'h4','Parautocthonous'
 *       unit 'reitoog-nappe', {className: 'bold'},[
 *         'Rietoog'
 *       ]
 *     ]
 *     h 'div#autochthon', [
 *        unitH 'nama', {className: 'bold'}, [
 *         'Nama Group (foreland basin)'
 *         unit 'schwarzrand', 'Schwarzrand Subgroup'
 *         unit 'zaris', 'Zaris Subgroup'
 *       ]
 *       unitH 'basement', {className: 'bold'}, [
 *         'Pre-Damara basement'
 *         unit 'newedam-group', 'Newedam Group'
 *         unit 'basement', 'Igneous/Metamorphic'
 *       ]
 *     ]
 *
 *   ]
 *
 *   createElement tree
 *
 *
 * module.exports = {createLegend}
 */

import hyper from "@macrostrat/hyper";
import styles from "./main.module.styl";

const h = hyper.styled(styles);

export function Legend() {
  return h("div#legend.legend", [
    h("div#nnc", [
      h("h1", "Naukluft nappe tectonic units"),
      h(Unit, { id: "kudu", title: "Kudu" }),
      h(UnitH, { id: "pavian", title: "Pavian" }, [
        h(Unit, { id: "northern-pavian", title: "Northern" }),
        h(UnitH, { id: "southern-pavian", title: "Southern" }, [
          h(Unit, { id: "arbeit-adelt-outlier", title: "Arbeit Adelt facies" }),
          h(Unit, { id: "bullsport-outlier", title: "Büllsport facies" }),
        ]),
      ]),
      h(UnitH, { id: "dassie", title: "Dassie" }, [
        h(Unit, { id: "eastern-dassie-nappe", title: "Eastern" }),
        h(Unit, { id: "western-dassie-nappe", title: "Western" }),
      ]),
      h(UnitH, { id: "zebra", title: "Zebra" }, [
        h(Unit, { id: "upper-zebra-nappe", title: "Upper" }),
        h(Unit, { id: "lower-zebra-nappe", title: "Lower" }),
        h(Unit, { id: "zebra-displaced-shale", title: "Intercalated shale" }),
      ]),
      h("h4", "Parautocthonous"),
      h(Unit, { id: "reitoog-nappe", className: "bold", title: "Rietoog" }),
    ]),
    h("div#autochthon", [
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
  const { children, className, id, title = null, showSwatch = true } = props;
  return h("div.subunit", { className, id }, [
    h("div.header", [
      h("h2", { id }, title ?? "title placeholder"),
      h.if(showSwatch)("div.swatch", [
        h(
          "svg.swatch",
          [h("rect", { width: 30, height: 20, fill: "lightgray" })], // Placeholder fill
        ),
      ]),
    ]),
    children,
  ]);
}
