import { ColumnProvider, useSettings } from "@macrostrat/column-components";
import { hyperStyled } from "@macrostrat/hyper";
import { useSurfaces } from "~/sections/providers";
import { LayoutGroup } from "../layout";
// Not sure if this one is really used
import styles from "../main.module.styl";
import { IsotopesColumn, MinimalIsotopesColumn } from "./carbon-isotopes";

const h = hyperStyled(styles);

function ChemostratigraphyGroup(props) {
  const { range, children } = props;
  return h(
    LayoutGroup,
    {
      name: null,
      className: "chemostratigraphy",
    },
    h(
      ColumnProvider,
      {
        range,
        zoom: 0.1,
      },
      children,
    ),
  );
}

function BaseChemostratigraphyColumn(props) {
  const { sections, colorScheme, range, showLines, keySection, nTicks } = props;
  const { correctIsotopeRatios, showCarbonIsotopes, showOxygenIsotopes } =
    useSettings();

  if (!showCarbonIsotopes && !showOxygenIsotopes) {
    return null;
  }

  let row = sections[0];
  if (keySection != null) {
    row = sections.find((d) => d.id === keySection);
  }
  const offset = row?.offset ?? props.offset ?? 0;
  const { location, ...rest } = row ?? {};

  const surfaces = useSurfaces();

  return h(
    ChemostratigraphyGroup,
    {
      range,
    },
    [
      h.if(showCarbonIsotopes)(IsotopesColumn, {
        ...rest,
        zoom: 0.1,
        key: "carbon-isotopes",
        offset,
        location: "",
        surfaces,
        colorScheme,
        corrected: correctIsotopeRatios,
        showLines,
        keySection,
        tickValues: [-10, -5, 0, 5],
      }),
      h.if(showOxygenIsotopes)(IsotopesColumn, {
        ...rest,
        nTicks,
        zoom: 0.1,
        system: "delta18o",
        label: "δ¹⁸O",
        tickValues: [-15, -10, -5, 0],
        domain: [-15, 2],
        key: "oxygen-isotopes",
        colorScheme,
        corrected: correctIsotopeRatios,
        offset,
        location: "",
        surfaces,
        showLines,
        keySection,
      }),
    ],
  );
}

interface ChemostratigraphyColumnProps {
  sections: any[];
  keySection?: string;
  showLines?: boolean;
}

export function ChemostratigraphyColumn(props: ChemostratigraphyColumnProps) {
  const { sections, keySection = "J", showLines = true } = props;

  let row = sections[0];
  if (keySection != null) {
    row = sections.find((d) => d.id === keySection);
  }
  const offset = row?.offset ?? 0;

  return h(BaseChemostratigraphyColumn, {
    range: rangeForSection(row),
    showLines,
    ...props,
  });
}

const rangeForSection = function (row) {
  let { start, end, clip_end } = row;
  if (clip_end == null) {
    clip_end = end;
  }
  return [start, clip_end];
};

export {
  BaseChemostratigraphyColumn,
  ChemostratigraphyGroup,
  IsotopesColumn,
  MinimalIsotopesColumn,
};
