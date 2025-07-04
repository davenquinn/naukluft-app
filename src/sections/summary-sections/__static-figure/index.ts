import h, { compose, C } from "@macrostrat/hyper";
import { render } from "react-dom";
import { useContext } from "react";

import { PlatformProvider } from "~/platform";
import {
  SectionDataProvider,
  SectionDataContext,
} from "~/sections/data-providers";
import { SectionPane } from "../section-pane";
import { SettingsProvider } from "../settings";
import { SectionSurfacesProvider } from "~/sections/providers";

import "./main.styl";
import "./fonts.css";

const StaticSectionSettings = C(SettingsProvider, {
  showFacies: true,
  showGrainsize: true,
  showLithology: true,
  showTriangleBars: true,
  showSequenceStratigraphy: true,
  showCarbonIsotopes: true,
  showOxygenIsotopes: true,
  isotopesPerSection: true,
  correlatedIsotopes: true,
  interactive: false,
});

const SummarySectionsStatic = function () {
  const sections = useContext(SectionDataContext);
  return h(SectionPane, {
    groupMargin: 400,
    columnMargin: 100,
    columnWidth: 150,
    sections,
    scrollable: false,
  });
};

const Figure = compose(
  PlatformProvider,
  SectionDataProvider,
  SectionSurfacesProvider,
  StaticSectionSettings,
  "div.page.section-page-static.section-page.summary-sections",
  "div.panel-container",
  SummarySectionsStatic,
);

export default (el, opts, cb) => render(h(Figure), el, cb);
