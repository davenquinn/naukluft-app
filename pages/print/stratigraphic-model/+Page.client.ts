import h from "@macrostrat/hyper";
import { PrintArea } from "~/shared/print-area";
import {
  SectionDataProvider,
  wrapWithSections,
} from "~/sections/data-providers";
import { SummarySectionsInner } from "~/sections/summary-sections";
import { SettingsProvider } from "@macrostrat/column-components";

import "~/shared/global-styles";
import { defaultSettings } from "~/sections/summary-sections/settings";

export function Page() {
  return h(
    PrintArea,
    { filename: "stratigraphic-model.pdf" },
    h(
      SettingsProvider,
      { ...defaultSettings, interactive: false, isotopesPerSection: true },
      h(SectionDataProvider, h(wrapWithSections(SummarySectionsInner))),
    ),
  );
}
