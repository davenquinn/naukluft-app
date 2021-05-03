/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import h from "@macrostrat/hyper";
import { ParameterIntervals } from "@macrostrat/column-components";
import { FaciesContext } from "../facies";
import { useContext } from "react";

const FaciesTractIntervals = function (props) {
  const { faciesTracts } = useContext(FaciesContext);
  const map = {};
  console.log(faciesTracts);
  for (let v of Array.from(faciesTracts)) {
    map[v.id] = v.color;
  }
  console.log(map);
  return h(ParameterIntervals, {
    parameter: "facies_tract",
    fillForInterval(param) {
      return map[param] || "transparent";
    },
    ...props,
  });
};

export { FaciesTractIntervals };
