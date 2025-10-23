import hyper from "@macrostrat/hyper";
import { Component, useContext } from "react";
import { useQuery } from "naukluft-data-backend";
import { ColumnSVG, ColumnContext } from "@macrostrat/column-components";
import { SummaryColumnProvider } from "./data-provider";
import { useSurfaces } from "~/sections/providers";
import styles from "./main.module.styl";
import {
  IncreaseDirection,
  Timescale,
  TimescaleOrientation,
  Interval,
} from "@macrostrat/timescale";

const h = hyper.styled(styles);

const LSLabel = (props) => {
  const { y, name, width, extend } = props;
  const x2 = extend ? width : 0;
  return h("g.label", { transform: `translate(${width},${y})` }, [
    h("line", {
      x1: -width,
      x2,
      y1: 0,
      y2: 0,
      stroke: "#888",
      strokeWidth: 2,
    }),
    h(
      "text",
      {
        transform: "rotate(-90) translate(5,-4)",
      },
      name,
    ),
  ]);
};

LSLabel.defaultProps = { width: 20, extend: false };

function buildTimescaleEntries(surfaces, names, keySection, range): Interval[] {
  let s1 = surfaces
    .filter((d) => d.type === "lithostrat") // only lithostratigraphy
    .map((d) => {
      // Get the surface height in the proper section
      const { section_height, ...rest } = d;
      return {
        height: section_height?.find((v) => v.section === keySection)?.height,
        ...rest,
      };
    })
    .filter((d) => d.height != null);

  s1.sort((a, b) => a.height - b.height);

  console.log(s1);

  let formations = [];
  let members = [];

  let id = 1;
  let parentID = null;
  for (const d of s1) {
    const surfaceData = names.find((v) => v.id === d.upper_unit);
    if (surfaceData == null) {
      continue;
    }
    const { height } = d;
    const color = surfaceData.color;

    // Commonality is how closely related the units are to each other.
    if (surfaceData.level === 3) {
      // If we have a formation but not a member, push that to formations only
      formations.push({
        height,
        name: surfaceData.short_name,
        id,
        color,
      });
      id++;
      continue;
    }
    if (d.commonality === 2) {
      formations.push({
        height,
        name: surfaceData.formation_short_name,
        id,
        color,
      });
      parentID = id;
      id++;
    }
    members.push({
      height,
      name: surfaceData.short_name,
      parent: parentID,
      id,
      color,
    });
    id++;
  }

  console.log(formations, members);

  // Iterate formations to add top heights
  const intervals = [
    {
      oid: 0,
      name: "Zebra River Group",
      eag: 0,
      lag: range[1],
      lvl: 0,
      col: "#CCCCCC",
      pid: null,
    },
  ];
  for (let i = 0; i < formations.length; i++) {
    const current = formations[i];
    const next = formations[i + 1];
    intervals.push({
      ...current,
      oid: current.id,
      nam: current.name,
      eag: current.height,
      lag: next?.height ?? range[1],
      pid: 0,
      lvl: 1,
      col: current.color,
    });
  }

  for (let i = 0; i < members.length; i++) {
    const current = members[i];
    const next = members[i + 1];
    intervals.push({
      ...current,
      oid: current.id,
      nam: current.name,
      eag: current.height,
      lag: next?.height ?? range[1],
      pid: current.parent,
      lvl: 2,
      col: current.color,
    });
  }

  return intervals;
}

export function LithostratigraphyColumn({ keySection = "J" }) {
  const names = useQuery("sections/summary/lithostratigraphy-names");
  let surfaces = useSurfaces();
  const { scale, range, pixelsPerMeter } = useContext(ColumnContext);

  if (names == null) {
    return null;
  }

  const intervals = buildTimescaleEntries(surfaces, names, keySection, range);
  const length = (range[1] - range[0]) * pixelsPerMeter * 0.1;

  return h(
    "div.lithostrat-key",
    h(Timescale, {
      orientation: TimescaleOrientation.VERTICAL,
      increaseDirection: IncreaseDirection.UP_RIGHT,
      length,
      absoluteAgeScale: true,
      showAgeAxis: false,
      ageRange: range,
      intervals,
      rootInterval: 0,
      levels: [1, 2],
    }),
  );
}

const BaseSVGSectionComponent = (props) => {
  let { padding, innerWidth, keySection } = props;
  let { left, right } = padding;

  const outerWidth = innerWidth + (left + right);

  // Set up number of ticks
  const transform = `translate(${left} ${props.padding.top})`;

  const minWidth = outerWidth;
  return h(
    "div.section-container.lithostratigraphy-names",
    {
      style: { minWidth },
    },
    [
      h("div.section-outer", [
        h(SummaryColumnProvider, { id: "J" }, [
          h(ColumnSVG, { width: 50 }, h(LithostratigraphyColumn, keySection)),
        ]),
      ]),
    ],
  );
};

BaseSVGSectionComponent.defaultProps = {
  zoom: 1,
  pixelsPerMeter: 20,
  skeletal: false,
  offset: 0,
  offsetTop: null,
  useRelativePositioning: true,
  showTriangleBars: false,
  trackVisibility: false,
  innerWidth: 40,
  height: 100, // Section height in meters
  lithologyWidth: 40,
  showFacies: true,
  showFloodingSurfaces: true,
  onResize() {},
  marginLeft: 0,
  padding: {
    left: 5,
    top: 10,
    right: 5,
    bottom: 10,
  },
};

export class LithostratKey extends Component {
  render() {
    return h("div.align-with-sections", [
      h(BaseSVGSectionComponent, this.props),
    ]);
  }
}
