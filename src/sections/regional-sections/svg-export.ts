/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import path from "path";

const exportSVG = function (node, outputFile) {
  // Should make this work only in Node
  const serializer = new XMLSerializer();
  if (node == null) {
    return;
  }
  const svgString = serializer.serializeToString(node);
  const { writeFileSync } = require("fs");
  console.log("Exporting sequence to ", outputFile);
  return writeFileSync(outputFile, svgString, "utf-8");
};

const filenameForID = (id, ext) => {
  return path.resolve(
    process.cwd(),
    __dirname,
    "sequence-data",
    `${id}.${ext}`
  );
};

const exportSequence = (id, node) =>
  function () {
    if (node == null) {
      return;
    }
    const overlay = node.querySelector(".sequence-link-overlay");
    if (overlay == null) {
      return;
    }
    const { x: rootX, y: rootY } = overlay.getBoundingClientRect();

    const sections = node.querySelectorAll(".section");
    if (sections.length <= 0) return;

    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.setAttribute("class", "sections");

    for (let section of Array.from(sections)) {
      const s1 = section.querySelector("g.lithology-column");
      const { x, y } = section.getBoundingClientRect();
      const s1a = s1.cloneNode(true);
      const t = `translate(${x - rootX + 5}, ${y - rootY + 5})`;
      s1a.setAttribute("transform", t);
      // Adobe Illustrator does not support SVG clipping paths.
      //const clip = s1a.querySelector("defs");
      //clip.parentNode.removeChild(clip);

      s1a.querySelector(".inner").removeAttribute("clip-path");

      const r = s1a.querySelector("use");
      r.parentNode.removeChild(r);
      g.appendChild(s1a);
    }

    const root = overlay.cloneNode(true);
    root.appendChild(g);

    return exportSVG(root, filenameForID(id, "svg"));
  };

export { filenameForID, exportSequence };
