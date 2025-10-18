import hyper from "@macrostrat/hyper";
import {
  ColumnDivision,
  ColumnSurface,
  ParameterIntervals,
} from "@macrostrat/column-components";
import { BaseUnit } from "@macrostrat/api-types";
import zebraNappeIntervals from "./naukluft-intervals.json";
import namaIntervals from "./nama-intervals.json";
import styles from "./+Page.client.module.sass";

const h = hyper.styled(styles);

import { MeasuredSection } from "./base-section";
import { defaultResolveID } from "@macrostrat/column-components";
import { PlatformProvider } from "~/platform";

type UnitDivision = ColumnDivision & BaseUnit;

interface ColumnSurface {
  height: number;
}

function applyPatterns<T extends ColumnSurface>(
  surfaces: T[],
  intervals: any[] = [],
): (BaseUnit & UnitDivision & T)[] {
  return surfaces.map((surface, i) => {
    let matchingIntervals = intervals.filter((d) => d.bottom == surface.height);
    matchingIntervals.sort((a, b) => b.level - a.level);
    const color = matchingIntervals[0]?.color;

    return { ...surface, pattern: defaultResolveID(surface), color };
  });
}

export function Page() {
  return h(PlatformProvider, h("div", [h(ZebraRiverGroup), h(NamaGroup)]));
}

function ZebraRiverGroup() {
  const intervals = composeIntervals(zebraNappeIntervals, 700);
  const surfaces = applyPatterns(columnDataZN, intervals);
  console.log(surfaces);
  return h(
    MeasuredSection,
    {
      data: surfaces,
      className: "zebra-nappe-section",
      timescaleProps: {
        intervals,
        levels: [0, 2],
        rootInterval: "zrg",
        borderColor: "#888",
      },
      range: [0, 700],
      pixelScale: 0.7,
    },
    h(ParameterIntervals, {
      parameter: "color",
      fillForInterval(param, interval) {
        return param;
      },
    }),
  );
}

const columnDataNama: ColumnSurface[] = [
  {
    height: 0,
    pattern: "sandstone",
    grainsize: "c",
  },
  { height: 30, grainsize: "m", pattern: "limestone" },
  { height: 135, grainsize: "ms", pattern: 677 },
  { height: 195, grainsize: "m", pattern: "limestone" },
  { height: 250, grainsize: "c", pattern: "limestone" },
  { height: 270, grainsize: "ms", pattern: "shale" },
  {
    height: 380,
    pattern: "shale",
    grainsize: "ms",
  },
  {
    height: 500,
    pattern: "sandstone",
    grainsize: "f",
  },
];

function NamaGroup() {
  const intervals = composeIntervals(namaIntervals, 550);
  const surfaces = applyPatterns(columnDataNama, intervals);
  return h(
    MeasuredSection,
    {
      data: surfaces,
      className: "zebra-nappe-section",
      timescaleProps: {
        intervals,
        levels: [0, 2],
        rootInterval: "nama",
        borderColor: "#888",
      },
      range: [0, 550],
      pixelScale: 0.7,
    },
    h(ParameterIntervals, {
      parameter: "color",
      fillForInterval(param, interval) {
        return param;
      },
    }),
  );
}

const columnDataZN: ColumnSurface[] = [
  {
    height: 0,
    pattern: "dolomite",
    grainsize: "ms",
  },
  { height: 80, grainsize: "c", pattern: "sandstone" },
  { height: 110, grainsize: "ms", pattern: "shale" },
  { height: 140, grainsize: "c", pattern: "sandstone" },
  { height: 150, grainsize: "ms", pattern: "dolomite" },
  { height: 190, grainsize: "m", pattern: "sandstone" },
  {
    height: 230,
    lithology: "dolomite",
    grainsize: "ms",
    pattern: "limestone",
  },
  {
    height: 280,
    lithology: "dolomite",
    grainsize: "c",
    pattern: 633,
  },
  {
    height: 290,
    grainsize: "ms",
    pattern: "shale",
  },
  {
    height: 320,
    grainsize: "c",
    pattern: "limestone",
  },
  {
    height: 330,
    grainsize: "ms",
    pattern: "shale",
  },
  {
    height: 370,
    grainsize: "c",
    pattern: "limestone",
  },
  {
    height: 390,
    lithology: "shale",
    grainsize: "ms",
    pattern: "shale",
  },
  {
    height: 470,
    pattern: "dolomite",
    grainsize: "c",
  },
  {
    height: 510,
    pattern: "limestone",
    grainsize: "s",
  },
  {
    height: 550,
    pattern: "dolomite",
    grainsize: "c",
  },
  {
    height: 600,
    pattern: "limestone",
    grainsize: "s",
  },
  {
    height: 650,
    pattern: 632,
    grainsize: "c",
  },
];

function composeIntervals(intervals, height) {
  return intervals.map((d) => {
    return {
      ...d,
      eag: d.bottom,
      lag: d.top,
      pid: d.parent,
      lvl: d.level - 2,
      oid: d.id,
      nam: d.name,
      col: d.color,
    };
  });
}
