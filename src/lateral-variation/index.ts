import * as d3 from "d3";
import "d3-selection-multi";
import { flatten, zip } from "underscore";
import "./main.styl";
import "../main.styl";
import labels from "./labels.json";
import { useRef, useEffect } from "react";
import { useQuery } from "naukluft-data-backend";
import h from "@macrostrat/hyper";

const createVisualization = function(
  el: HTMLElement,
  units: any[],
  sections: any[],
  surfaces: any[]
) {
  const wrap = d3.select(el);

  const size = {
    width: 1200,
    height: 1000
  };

  const svg = wrap.append("svg").attrs(size);

  svg.call(lithology);

  const locations = d3
    .nest()
    .key(d => d.location)
    .entries(sections);

  const marginX = 20;
  const scaleSize = 100;
  const padding = 500;
  const per_section = Math.floor(
    (size.width - padding - marginX - 2 * scaleSize) / sections.length
  );

  // Construct lateral scale
  const domain = [];
  const range = [];
  let i = 20 + scaleSize;
  for (let l of Array.from(locations)) {
    l.values.sort((a, b) => a.section > b.section);
    for (let s of Array.from(l.values)) {
      const val = s.section.trim();
      domain.push(val);
      range.push(i);
      i += per_section;
    }
    i += Math.floor(padding / (locations.length - 1));
  }

  const x = d3
    .scaleOrdinal()
    .domain(domain)
    .range(range);

  const y = d3
    .scaleLinear()
    .domain([-50, 800])
    .range([size.height - 50, 0]);

  const areaPath = d3
    .area()
    .x(d => d[0])
    .y0(d => y(d[1]))
    .y1(d => y(d[2]));

  const linePath = d3
    .line()
    .x(d => d[0])
    .y(d => y(d[1]));

  const applyEdges = function(v) {
    i = v[0].slice();
    const j = v[v.length - 1].slice();
    i[0] -= marginX;
    j[0] += marginX;
    v.unshift(i);
    return v.push(j);
  };

  const double = function(a, b) {
    if (b == null) {
      b = a;
    }
    return flatten(zip(a, b));
  };

  const createX = function(d) {
    const xv = d.section.map(x);
    return double(
      xv,
      xv.map(d => d + 20)
    );
  };

  const areaGenerator = function(d) {
    const v = zip(createX(d), double(d.start), double(d.end));
    applyEdges(v);
    return areaPath(v);
  };

  const lineGenerator = function(d) {
    const v = zip(createX(d), double(d.height));
    applyEdges(v);
    return linePath(v);
  };

  const sv = [0, 700];
  const ys = d3
    .scaleLinear()
    .domain(sv)
    .range(sv.map(y));

  const yAxis = d3
    .axisLeft()
    .scale(ys)
    .ticks(10)
    .tickSize(10);

  const mid = svg.append("g");
  const v = svg.append("g");
  const bkg = svg.append("g");

  const ax = svg.append("g").attrs({
    class: "axis",
    transform: `translate(${scaleSize - 20} 0)`
  });

  ax.append("g").call(yAxis);

  ax.append("text")
    .text("Stratigraphic Height (m)")
    .attrs({
      class: "label",
      transform: `translate(-50,${y(350)}) rotate(-90)`
    });

  let sel = mid.selectAll("g").data(units);
  let g = sel.enter().append("g");

  g.append("path").attrs({
    d: areaGenerator,
    fill(d) {
      return d.color;
    },
    "fill-opacity": 0.7,
    stroke: "transparent"
  });

  g.append("path").attrs({
    d: areaGenerator,
    fill(d) {
      return `url(#${d.dominant_lithology})`;
    },
    "fill-opacity": 0.7,
    stroke: "transparent"
  });

  sel = v.selectAll("path").data(surfaces);

  sel
    .enter()
    .append("path")
    .attrs({
      d: lineGenerator,
      fill: "transparent",
      stroke: "black",
      "stroke-width"(d) {
        return d.weight;
      }
    });

  // Lay out sections
  sel = bkg.selectAll("g.section").data(sections);

  const xloc = d => x(d.section.trim());

  g = sel
    .enter()
    .append("g")
    .attrs({
      class: "section",
      transform(d) {
        return `translate(${xloc(d)} ${y(d.end)})`;
      }
    });

  g.append("rect").attrs({
    fill: "black",
    stroke: "black",
    "stroke-width": 2,
    width: 20,
    height(d) {
      return y(d.start) - y(d.end);
    }
  });

  g = bkg.append("g").attrs({
    class: "sections",
    transform: `translate(0 ${size.height - 60})`
  });

  g.append("text")
    .attrs({ class: "label smaller" })
    .text("Section");

  const names = g.selectAll("text.name").data(sections);

  names
    .enter()
    .append("text")
    .attrs({
      class: "name",
      x: xloc
    })
    .text(d => d.section.trim());

  const locales = svg.append("g").attrs({
    class: "locality",
    transform: `translate(0 ${size.height - 10})`
  });

  locales
    .append("text")
    .attrs({ class: "label smaller" })
    .text("Locality");

  sel = locales.selectAll("text.loc").data(labels.locality);

  g = sel
    .enter()
    .append("text")
    .attrs({
      class: "loc",
      transform(d) {
        return `translate(${d.x} 0)`;
      }
    });

  g.append("tspan").text(d => d.t1);

  g.append("tspan")
    .text(d => ` (${d.t2})`)
    .attrs({ class: "label" });

  const fm = svg.append("g").attrs({
    class: "formations",
    transform: "rotate(90) translate(0 -1110)"
  });

  fm.append("text")
    .attrs({
      class: "label smaller",
      transform: `translate(${y(350)} -50)`
    })
    .text("Formation");

  sel = fm.selectAll("text.fm").data(labels.formation);

  sel
    .enter()
    .append("text")
    .text(d => d.name)
    .attrs({
      class: "fm",
      transform(d) {
        return `translate(${y(d.h)} 0)`;
      }
    });

  const xv = d3
    .scaleLinear()
    .domain([0, 1])
    .range([0, size.width]);

  const clipPath = d3
    .area()
    .x(d => xv(d[0]))
    .y0(d => y(d[1]))
    .y1(-5)
    .curve(d3.curveCardinal);

  const data1 = [
    [0, 500],
    [0.1, 520],
    [0.25, 700],
    [0.4, 400],
    [0.6, 420],
    [0.7, 400],
    [0.8, 650],
    [0.9, 690],
    [1, 650]
  ];

  return bkg
    .append("path")
    .datum(data1)
    .attrs({
      "comp-op": "multiply",
      class: "clip",
      d: clipPath
    });
};

function LateralVariation(props) {
  const ref = useRef<HTMLElement>();
  const heights = useQuery("lateral-variation/unit-heights");
  const sections = useQuery("lateral-variation/sections");
  const surfaces = useQuery("lateral-variation/boundary-heights");
  const deps: [HTMLElement | undefined, any[], any[], any[]] = [
    ref.current,
    heights,
    sections,
    surfaces
  ];

  useEffect(() => {
    for (const item of deps) {
      if (item == null) return;
    }
    createVisualization(...deps);
  }, deps);

  return h("div#lateral-variation", { ref });
}

export default LateralVariation;
