import chroma from "chroma-js";
import textures from "textures";
import { renderTexturesPattern } from "@macrostrat/map-styles";
import { toRGBAString, asChromaColor } from "@macrostrat/color-utils";
import { runQuery, useQuery } from "naukluft-data-backend";
import h from "@macrostrat/hyper";
import { useEffect, useMemo, useRef } from "react";
import { select } from "d3-selection";
import { atom, useAtomValue } from "jotai";

export function buildTectonicPatternResolver() {
  /** Converted from old CoffeeScript implementation */

  return async (key: string, args: string[], options) => {
    const [name, color] = args;
    const patternFunc = patternIndex[name];
    if (color == null) {
      return null;
    }
    if (patternFunc == null) {
      return createSolidColorImage(color);
    }

    const spec = patternFunc(color ?? "black");

    return await renderTexturesPattern(spec, { pixelRatio: 5 });
  };
}

function dassiePattern(o: string | null) {
  return (color) => {
    const c = toRGBAString(chroma(color).brighten(0.5));
    return textures
      .lines()
      .size(8)
      .strokeWidth(1)
      .orientation(o)
      .stroke(c)
      .background(color);
  };
}

function southernPavianPattern(o: string | null) {
  return (color) => {
    const zc = toRGBAString(chroma(color).darken(0.5).luminance(0.1));
    return textures
      .lines()
      .size(6)
      .strokeWidth(1.5)
      .orientation(o)
      .stroke(zc)
      .background(color);
  };
}

const patternIndex: Record<string, any> = {
  "upper-zebra-nappe": (color) => {
    const c = toRGBAString(chroma(color).darken(0.5).luminance(0.1));
    return textures
      .lines()
      .orientation("6/8")
      .size(4)
      .strokeWidth(1)
      .stroke(c)
      .background(color);
  },
  "zebra-displaced-shale": (color: any) => {
    const sc = toRGBAString(chroma("#94ae93").luminance(0.8));
    return textures.lines().size(4).strokeWidth(1).stroke(sc).background(color);
  },
  "arbeit-adelt-outlier": southernPavianPattern("6/8"),
  "bullsport-outlier": southernPavianPattern("2/8"),
  "eastern-dassie-nappe": dassiePattern("2/8"),
  "western-dassie-nappe": dassiePattern("6/8"),
  "reitoog-nappe": (color) => {
    const c = toRGBAString(chroma(color).darken(0.8));
    return textures
      .lines()
      .size(4)
      .orientation("6/8")
      .strokeWidth(1)
      .stroke(c)
      .background(color);
  },
};

function createSolidColorImage(imgColor) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = 40;
  canvas.height = 40;
  ctx.fillStyle = imgColor;
  ctx.fillRect(0, 0, 40, 40);
  const data = ctx.getImageData(0, 0, 40, 40);
  // Remove canvas
  canvas.remove();
  return data;
}

const unitColorsAtom = atom(async () => {
  const res = await runQuery("map-data/unit-legend-info");
  const unitColorMap = new Map<string, string>();
  res.forEach((unit: any) => {
    if (unit.unit_id == null || unit.color == null) return;
    unitColorMap.set(unit.unit_id.trim(), unit.color.trim());
  });
  return unitColorMap;
});

function useUnitColors(): Map<string, string> | null {
  return useAtomValue(unitColorsAtom);
}

export function LegendSwatch({
  id,
  width = 30,
  height = 30,
  scale = 1,
  className,
}) {
  const unitColors = useUnitColors();
  const ref = useRef(null);

  useEffect(() => {
    const svg = select(ref.current);
    if (ref.current == null || unitColors == null) {
      return;
    }

    const color = unitColors.get(id);
    if (color == null) {
      return;
    }

    let fill = color;

    svg.empty();

    const patternFunc = patternIndex[id];

    if (patternFunc != null) {
      const spec = patternFunc(color);
      svg.call(spec);
      fill = spec.url();
    }

    // Apply the pattern to a rectangle
    svg
      .append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", fill);
  }, [id, unitColors, ref.current]);

  return h(
    "div.legend-swatch",
    { className },
    h("svg.swatch", { width, height, ref }),
  );
}
