import { hyperStyled } from "@macrostrat/hyper";
import { useSettings } from "@macrostrat/column-components";
import { ChemostratigraphyColumn } from "./chemostrat";
import { SectionLinkOverlay, SectionContainer } from "../components";
import {
  GeneralizedLithostratKey,
  SummaryLithostratigraphyColumn,
  SummaryLithostratigraphyKey,
} from "./lithostrat-key";
import { ArrangedSections } from "./layout";
import { LegendFull } from "./legend";
import { useSurfaces } from "~/sections/providers";
import { SectionData } from "./layout/defs";
import styles from "./main.module.styl";
import "../main.styl";

const h = hyperStyled(styles);

interface SectionPaneProps {
  scrollable: boolean;
  groupMargin: number;
  columnMargin: number;
  columnWidth: number;
  sections: SectionData[];
  tightenSpacing: boolean;
}

export function SectionPane(props: SectionPaneProps) {
  let {
    sections,
    groupMargin = 400,
    columnMargin = 100,
    columnWidth = 150,
    tightenSpacing = true,
    scrollable = true,
  } = props;

  const surfaces = useSurfaces();
  const { showLegend } = useSettings();

  if (sections == null) {
    return null;
  }
  if (!(sections.length > 0)) {
    return null;
  }

  const row = sections.find((d) => d.id === "J");
  let { offset } = row;

  const options = useSettings();
  const showChemostrat = options.correlatedIsotopes;
  const overflow = scrollable ? "scroll" : "inherit";

  const pixelsPerMeter = 20;

  return h("div.section-pane", { style: { overflow } }, [
    h.if(showLegend)(LegendFull),
    h(SectionContainer, [
      h(SectionLinkOverlay, {
        connectLines: true,
        surfaces,
        extendLinks: true,
      }),
      h.if(showChemostrat)(ChemostratigraphyColumn, {
        sections,
        showLines: false,
        simple: true,
        pixelsPerMeter,
      }),
      h(SummaryLithostratigraphyKey, {
        zoom: 0.1,
        key: "key",
        keySection: "J",
        offset,
        pixelsPerMeter,
      }),
      h("div#section-container", [
        h(ArrangedSections, {
          sections,
          groupMargin,
          columnMargin,
          columnWidth,
          tightenSpacing,
          pixelsPerMeter,
        }),
      ]),
    ]),
  ]);
}
