import { compose, hyperStyled } from "@macrostrat/hyper";
import { SectionPositionProvider } from "../components";
import { BaseSectionPage } from "../components";
import { EditorProvider } from "./editor";
import { SummarySectionsSettings, defaultSettings } from "./settings";
import { useSettings } from "@macrostrat/column-components";
import { ChemostratigraphyColumn } from "./chemostrat";
import { SectionLinkOverlay, SectionContainer } from "../components";
import { SummaryLithostratigraphyKey } from "./lithostrat-key";
import { ArrangedSections } from "./layout";
import { LegendFull } from "./legend";
import { useSurfaces } from "~/sections/providers";
import { SectionData } from "./layout/defs";
import styles from "./main.module.styl";
import { SummarySectionsMap } from "./map";

const h = hyperStyled(styles);

function SummarySections({
  showNavigationController = true,
  settingsPanel = SummarySectionsSettings,
  ...rest
}) {
  return h(
    BaseSectionPage,
    {
      id: "summary-sections",
      className: "summary-sections",
      settingsPanel,
      defaultSettings,
    },
    [
      h(SummarySectionsInner, {
        ...rest,
      }),
    ],
  );
}

const SummarySectionsInner = compose(
  SectionPositionProvider,
  EditorProvider,
  SectionPane,
);

interface SectionPaneProps {
  scrollable: boolean;
  groupMargin: number;
  columnMargin: number;
  columnWidth: number;
  sections: SectionData[];
  tightenSpacing: boolean;
}

function SectionPane(props: SectionPaneProps) {
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
  const options = useSettings();

  if (sections == null || sections.length == 0) {
    return null;
  }

  const row = sections.find((d) => d.id === "J");
  let { offset } = row;

  const showChemostrat = options.correlatedIsotopes;
  const overflow = scrollable ? "scroll" : "inherit";

  const pixelsPerMeter = 20;

  return h("div.section-pane.summary-sections", { style: { overflow } }, [
    h(SectionContainer, [
      h.if(showLegend)(LegendFull, [
        h(SummarySectionsMap, {
          bounds: [16, -24.4, 16.32, -24.16],
          className: "inset-map",
          metersPerPixel: 90,
        }),
      ]),
      h(SectionLinkOverlay, {
        connectLines: true,
        surfaces,
      }),
      h.if(showChemostrat)(ChemostratigraphyColumn, {
        sections,
        showLines: false,
        simple: true,
        pixelsPerMeter,
        keySection: "J",
      }),
      h(SummaryLithostratigraphyKey, {
        zoom: 0.1,
        key: "key",
        keySection: "J",
        offset,
        pixelsPerMeter,
      }),
      h(ArrangedSections, {
        sections,
        groupMargin,
        columnMargin,
        columnWidth,
        tightenSpacing,
        pixelsPerMeter,
      }),
    ]),
  ]);
}

export { SummarySectionsInner, SummarySections, SectionPane };
