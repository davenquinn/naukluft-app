import h from "@macrostrat/hyper";
import { PrintArea } from "~/shared/print-area";
import { GeneralizedSectionsInner } from "~/sections/generalized-sections";
import { SectionDataProvider } from "~/sections/data-providers";
import "~/shared/global-styles";
import {
  defaultSettings,
  SettingsProvider,
} from "~/sections/summary-sections/settings";
import { PlatformProvider, TargetEnvironment } from "~/platform";

export function Page() {
  return h(
    PrintArea,
    { filename: "generalized-sections.pdf" },
    h(
      PlatformProvider,
      {
        environment: TargetEnvironment.Print,
      },
      h(
        SettingsProvider,
        { ...defaultSettings, interactive: false, correctIsotopeRatios: true },
        h(
          SectionDataProvider,
          /** We removed the correlated chemostratigraphy from the structure paper,
           * as it was not important to the story presented. However, we keep the
           * ability to turn it back on if desired.
           */
          h(GeneralizedSectionsInner, { showChemostrat: false }),
        ),
      ),
    ),
  );
}
