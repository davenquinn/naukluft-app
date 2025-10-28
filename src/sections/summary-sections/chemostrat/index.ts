import { ColumnProvider, useSettings } from "@macrostrat/column-components";
import { hyperStyled } from "@macrostrat/hyper";
import { useSurfaces } from "~/sections/providers";
import { LayoutGroup } from "../layout";
// Not sure if this one is really used
import styles from "./main.module.styl";
import {
  IsotopesColumn,
  IsotopesColumnSimple,
  MinimalIsotopesColumn,
} from "./carbon-isotopes";
import { useIsotopes } from "~/sections/summary-sections/chemostrat/data-manager";
import { ColumnTracker } from "~/sections/components";
import classNames from "classnames";

const h = hyperStyled(styles);

function ChemostratigraphyGroup(props) {
  const {
    range,
    children,
    title = "Correlated chemostratigraphy",
    pixelsPerMeter,
  } = props;
  return h("div.correlated-chemostratigraphy.chemostratigraphy", [
    h("div.chemostratigraphy-header", [h("h2.chemostratigraphy-title", title)]),
    h(
      "div.chemostratigraphy-body",
      h(
        ColumnProvider,
        {
          range,
          zoom: 0.1,
          pixelsPerMeter,
        },
        [h(ColumnTracker, { id: "chemostratigraphy" }), children],
      ),
    ),
  ]);
}

export function SimpleChemostratigraphyColumn(props) {
  const {
    sections,
    range,
    showLines,
    keySection,
    nTicks,
    pixelsPerMeter,
    title,
  } = props;

  let row = sections[0];
  if (keySection != null) {
    row = sections.find((d) => d.id === keySection);
  }
  const offset = row?.offset ?? props.offset ?? 0;
  const { location, ...rest } = row ?? {};

  const surfaces = useSurfaces();
  let isotopes = useIsotopes();

  const allIsotopes = Array.from(isotopes).filter(([k, v]) => {
    return !["K", "W1", "L"].includes(k);
  });

  return h(
    ChemostratigraphyGroup,
    {
      range,
      pixelsPerMeter,
    },
    [
      h(IsotopesColumnSimple, {
        isotopes: allIsotopes,
        ...rest,
        width: 60,
        zoom: 0.1,
        key: "carbon-isotopes",
        system: "delta13c",
        offset,
        location: "",
        surfaces,
        showLines,
        keySection,
        tickValues: [-10, -5, 0, 5],
        padding: { left: 5, top: 10, right: 5, bottom: 60 },
      }),
      h(IsotopesColumnSimple, {
        isotopes: allIsotopes,
        ...rest,
        width: 60,
        nTicks,
        zoom: 0.1,
        system: "delta18o",
        label: "δ¹⁸O",
        tickValues: [-15, -10, -5, 0],
        domain: [-15, 2],
        key: "oxygen-isotopes",
        offset,
        location: "",
        surfaces,
        showLines,
        keySection,
        padding: { left: 5, top: 10, right: 5, bottom: 60 },
      }),
    ],
  );
}

function BaseChemostratigraphyColumn(props) {
  const { sections, colorScheme, range, showLines, keySection, nTicks, title } =
    props;
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
      title,
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
  simple?: boolean;
}

export function ChemostratigraphyColumn(props: ChemostratigraphyColumnProps) {
  const { sections, keySection = "J", showLines = true, simple = true } = props;

  let row = sections[0];
  if (keySection != null) {
    row = sections.find((d) => d.id === keySection);
  }

  const component = simple
    ? SimpleChemostratigraphyColumn
    : BaseChemostratigraphyColumn;

  return h(component, {
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
