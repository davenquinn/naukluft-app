/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS202: Simplify dynamic range loops
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import { select } from "d3-selection";

const removeLines = function (f, niter = 1) {
  // Strip the first N lines of text
  for (
    let i = 0, end = niter, asc = 0 <= end;
    asc ? i < end : i > end;
    asc ? i++ : i--
  ) {
    f = f.substring(f.indexOf("\n") + 1);
  }
  return f;
};

const distanceFromLine = function (p1, p2, p3) {
  // distance of p3 from the line defined
  // between p1 and p2
  const [x1, y1] = p1;
  const [x2, y2] = p2;
  const [x3, y3] = p3;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const top = Math.abs(dy * x3 - dx * y3 + x2 * y1 - y2 * x1);
  const btm = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
  return top / btm;
};

const coordAtLength = function (path, pos) {
  let { x, y } = path.getPointAtLength(pos);
  x = Math.round(x * 10) / 10;
  y = Math.round(y * 10) / 10;
  return [x, y];
};

const extractLine = (opts = {}) =>
  function (node) {
    if (opts.simplifyThreshold == null) {
      opts.simplifyThreshold = 0.02;
    }
    if (opts.simplify == null) {
      opts.simplify = true;
    }
    if (node.nodeName === "line") {
      // Lines don't have getTotalLength or points methods
      const v = (id) => node.getAttribute(id) || 0;
      return [
        [v("x1"), v("y1")],
        [v("x2"), v("y2")],
      ];
    }
    if (node.points != null) {
      // We can extract directly
      return Array.from(node.points, ({ x, y }) => [x, y]);
    }
    // We must interpolate from path data

    const len = node.getTotalLength();
    if (len === 0) {
      return;
    }
    let pos = 0;
    const coordinates = [];
    while (pos < len) {
      coordinates.push(coordAtLength(node, pos));

      if (coordinates.length >= 3 && opts.simplify != null) {
        const c1 = coordinates.slice(coordinates.length - 3, 3);
        if (c1.length === 3) {
          const dist = distanceFromLine(c1[0], c1[2], c1[1]);
          if (dist < opts.simplifyThreshold) {
            coordinates.splice(coordinates.length - 2, 1);
          }
        }
      }
      // pop second to last
      pos += 0.2;
    }
    coordinates.push(coordAtLength(node, len));
    return coordinates;
  };

const extractTextPosition = function (node) {
  const txt = select(node).text();
  const { x, y, width, height } = node.getBBox();
  const { e, f } = node.transform.baseVal[0].matrix;
  const loc = [e + x + width / 2, f + y + height / 2];
  const geometry = { coordinates: loc, type: "Point" };
  return { type: "Feature", id: txt, geometry };
};

const extractLines = function (sel) {
  /* Get path data */
  const pathNodes = sel.selectAll("path,line,polygon,polyline");
  return Array.from(pathNodes.nodes(), extractLine());
};

const extractTextPositions = function (sel) {
  const textNodes = sel.selectAll("text");
  return Array.from(textNodes.nodes(), extractTextPosition);
};

export { extractLines, extractTextPositions, removeLines };
