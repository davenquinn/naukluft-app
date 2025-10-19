import hyper from "@macrostrat/hyper";
import {
  ColumnProvider,
  ColumnSVG,
  ColumnAxis,
  LithologyBoxes,
  GeneralizedSectionColumn,
  GrainsizeLayoutProvider,
  useColumn,
} from "@macrostrat/column-components";
import {
  Timescale,
  TimescaleOrientation,
  IncreaseDirection,
} from "@macrostrat/timescale";
import styles from "./base-section.module.sass";

const h = hyper.styled(styles);

interface IColumnProps {
  data: ColumnSurface[];
  pixelScale?: number;
  range?: [number, number];
  showTimescale?: boolean;
  width?: number;
}

interface MacrostratBaseUnit {
  top: number;
  bottom: number;
  t_age: number;
  b_age: number;
}

type UnitDivision = MacrostratBaseUnit;

interface ColumnSurface {
  unit_id: number;
  height: number;
}

function buildDivisions<T extends ColumnSurface>(
  surfaces: T[],
  range: [number, number],
): (UnitDivision & T)[] {
  const units = surfaces.filter((d) => d.unit_id != null);
  return surfaces.map((surface, i) => {
    const { height, ...rest } = surface;
    const bottom = height;
    const nextSurface = surfaces[i + 1];
    const nextHeight = nextSurface != null ? nextSurface.height : range[1];
    const nextUnit = units[i + 1];
    const nextUnitHeight = nextUnit != null ? nextUnit.height : range[1];
    return {
      top: nextHeight,
      bottom,
      t_age: bottom,
      b_age: bottom + nextUnitHeight, // this is wrong,
      ...rest,
    } as UnitDivision & T;
  });
}

function MeasuredSectionContainer(
  props: IColumnProps & {
    children: React.ReactNode;
    timescaleIntervals: Interval[] | null;
    timescaleLevels: number[];
    className?: string;
  },
) {
  // Section with "squishy" time scale
  const {
    data = [],
    range,
    children,
    showTimescale = true,
    timescaleProps = {},
    className,
    width = 250,
    showAxis = true,
  } = props;
  let { pixelScale = 1.3 } = props;

  let divisions = buildDivisions(data, range);

  return h("div.measured-section.column", { className }, [
    h(
      ColumnProvider,
      {
        divisions,
        range,
        pixelsPerMeter: pixelScale,
      },
      [
        h.if(showAxis)(
          ColumnSVG,
          {
            innerWidth: 0,
            padding: 30,
            paddingLeft: 40,
            paddingBottom: 30,
            paddingRight: 1,
          },
          [h(ColumnAxis), h(ColumnAxisLabel)],
        ),
        h.if(showTimescale)(Timescale, {
          orientation: TimescaleOrientation.VERTICAL,
          increaseDirection: IncreaseDirection.UP_RIGHT,
          length: (range[1] - range[0]) * pixelScale,
          absoluteAgeScale: true,
          showAgeAxis: false,
          ageRange: range,
          ...timescaleProps,
        }),
        children,
      ],
    ),
  ]);
}

export function StandaloneAxisScale(
  props: IColumnProps & {
    children: React.ReactNode;
    timescaleIntervals: Interval[] | null;
    timescaleLevels: number[];
    className?: string;
  },
) {
  // Section with "squishy" time scale
  const { range, className } = props;
  let { pixelScale = 1.3 } = props;

  return h("div.measured-section.column.axis-scale", { className }, [
    h(
      ColumnProvider,
      {
        divisions: [],
        range,
        pixelsPerMeter: pixelScale,
      },
      h(
        ColumnSVG,
        {
          innerWidth: 0,
          padding: 30,
          paddingLeft: 40,
          paddingBottom: 30,
          paddingRight: 1,
        },
        [h(ColumnAxis), h(ColumnAxisLabel)],
      ),
    ),
  ]);
}

function ColumnAxisLabel() {
  const scale = useColumn().scale;
  const range = scale.range();
  const pixelHeight = Math.abs(range[0] - range[1]);
  return h(
    "text.column-axis-label",
    {
      x: -25,
      y: pixelHeight / 2,
      transform: `rotate(-90, -25, ${pixelHeight / 2})`,
      className: "axis-label",
      textAnchor: "middle",
    },
    "Approx. thickness (m)",
  );
}

export function MeasuredSection(
  props: IColumnProps & {
    children: React.ReactNode;
    timescaleIntervals: Interval[] | null;
    timescaleLevels: number[];
    className?: string;
    frame: any;
  },
) {
  // Section with "squishy" time scale
  const { children, className, width = 250, frame, ...rest } = props;

  const grainsizeScaleStart = props.grainsizeScaleStart ?? 0.5 * width;
  // const unitData: UnitLong[] = useAPIResult("/units", params);
  // // let unitDivs = buildDivisions(
  // //   data.filter(d => d.unit_id != null),
  // //   range
  // // );
  // if (unitData != null) {
  //   divisions = mergeUnitData(unitData, divisions);
  // }

  return h(MeasuredSectionContainer, { className, children, ...rest }, [
    h(
      ColumnSVG,
      {
        innerWidth: 80,
        padding: 30,
        paddingLeft: 0,
        paddingBottom: 30,
        paddingRight: 10,
      },
      [
        h(
          GrainsizeLayoutProvider,
          {
            width: 80,
            grainsizeScaleStart: 40,
          },
          [
            h(GeneralizedSectionColumn, { frame }, [
              children,
              h(LithologyBoxes, { resolveID: (d) => d.pattern }),
            ]),
          ],
        ),
      ],
    ),
  ]);
}
