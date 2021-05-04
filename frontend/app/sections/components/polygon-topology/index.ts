/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
/*
A set of tools to polygonize a topology using PostGIS.
Basically, this is a poor man's Adobe Illustrator Live Paint.
*/

import h from "@macrostrat/hyper";
import { geoPath, geoTransform } from "d3-geo";
import sql from "./polygonize.sql";
import { useState } from "react";
import { useAsyncEffect } from "use-async-effect";
import { runQuery } from "~/data-backend";

const proj = geoTransform({
  point(px, py) {
    return this.stream.point(px, py);
  },
});
const pathGenerator = geoPath().projection(proj);

const TopoPolygon = function ({ feature, fill }) {
  const { geometry, facies_id } = feature;
  if (!geometry) {
    return null;
  }
  return h("path", { className: facies_id, d: pathGenerator(geometry), fill });
};

const TopoPolygons = ({ polygons, generateFill }) =>
  h(
    "g.polygons",
    polygons.map(function (p, i) {
      const fill = generateFill(p, i);
      return h(TopoPolygon, { feature: p, fill });
    })
  );

const PolygonTopology = function (props) {
  const { lines, points, generateFill, children, ...rest } = props;

  const [polygons, setPolygons] = useState(null);

  const getPolygons = async function () {
    if (lines == null || points == null) {
      return;
    }
    const res = await runQuery(sql, {
      geometry: {
        coordinates: lines,
        type: "MultiLineString",
      },
      points,
    });
    return setPolygons(res);
  };

  useAsyncEffect(getPolygons, [lines, points]);

  if (polygons == null) {
    return null;
  }
  return h("g.polygon-container", [
    h(TopoPolygons, { polygons, generateFill }),
    children,
  ]);
};

export { PolygonTopology };
export * from "./extract-svg";
