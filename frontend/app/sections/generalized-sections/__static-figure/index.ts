import h, { compose, C } from "@macrostrat/hyper";
import { render } from "react-dom";

import { PlatformProvider } from "~/platform";
import { SectionDataProvider } from "~/sections/data-providers";
import { GeneralizedSections } from "../main";
import { SettingsProvider } from "@macrostrat/column-components";
import { SectionSurfacesProvider } from "~/sections/providers";
import { Legend } from "./legend";

import "../../summary-sections/__static-figure/fonts.css";
import "./main.styl";

const StaticSectionSettings = C(SettingsProvider, {
  showFacies: true,
  showGrainsize: true,
  showLithology: true,
  showTriangleBars: true,
  showSequenceStratigraphy: true,
  showCarbonIsotopes: true,
  showOxygenIsotopes: true,
  isotopesPerSection: false,
  correlatedIsotopes: true,
  interactive: false,
});

const Inner = () => {
  return h("div", [h(GeneralizedSections), h(Legend)]);
};

const Figure = compose(
  PlatformProvider,
  SectionDataProvider,
  SectionSurfacesProvider,
  StaticSectionSettings,
  "div.page.generalized-sections-static",
  Inner
);

export default (el, opts, cb) => render(h(Figure), el, cb);
