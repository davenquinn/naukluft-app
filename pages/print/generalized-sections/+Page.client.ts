import h from "@macrostrat/hyper";
import { PrintArea } from "~/shared/print-area";
import { GeneralizedSectionsInner } from "~/sections/summary-sections/generalized";
import {
  SectionDataProvider,
  wrapWithSections,
} from "~/sections/data-providers";
import "~/shared/global-styles";

export function Page() {
  return h(
    PrintArea,
    { filename: "generalized-sections.pdf" },
    h(SectionDataProvider, h(wrapWithSections(GeneralizedSectionsInner))),
  );
}
