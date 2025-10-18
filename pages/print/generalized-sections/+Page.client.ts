import h from "@macrostrat/hyper";
import { PrintArea } from "~/shared/print-area";
import { GeneralizedSectionsInner } from "~/sections/generalized-sections";
import {
  SectionDataProvider,
  wrapWithSections,
} from "~/sections/data-providers";
import "~/shared/global-styles";
import {
  defaultSettings,
  SettingsProvider,
} from "~/sections/summary-sections/settings";
import { PlatformProvider } from "~/platform";

export function Page() {
  return h(
    PrintArea,
    { filename: "generalized-sections.pdf" },
    h(
      PlatformProvider,
      h(
        SettingsProvider,
        { ...defaultSettings, interactive: false, correctIsotopeRatios: true },
        h(SectionDataProvider, h(wrapWithSections(GeneralizedSectionsInner))),
      ),
    ),
  );
}
