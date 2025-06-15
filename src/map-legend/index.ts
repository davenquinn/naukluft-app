import * as d3 from "d3";
import "d3-selection-multi";
import { stratify } from "d3-hierarchy";
import style from "./main.styl";
import { query } from "../db";
import classNames from "classnames";

const makeMapUnit = (d) => console.log(d);

var makeNested = function (item) {
  // Recursively callable function to make nested data
  //
  const h = item.append("div").attrs({ class: style.header });

  h.append("h1").text((d) => d.data.name);
  h.append("p").text((d) => d.data.desc);

  const color = (d) => d.data.color || "white";

  item.styles({
    "border-color": color,
  });

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
        console.log(d);
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

const createLegend = async function (el) {
  const data = await query("unit-data", null, { baseDir: __dirname });

  const wrap = d3.select(el);

  data.push({ unit_id: "root", name: "Legend" });

  const t = (key) =>
    function (d) {
      try {
        return d[key].trim();
      } catch (error) {
        return d[key];
      }
    };

  const strat = stratify().id(t("unit_id")).parentId(t("member_of"));

  const units = strat(data);

  return wrap
    .append("div")
    .datum(units)
    .attrs({ class: style.root })
    .call(makeNested);
};

export default createLegend;
