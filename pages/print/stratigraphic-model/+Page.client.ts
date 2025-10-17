import h from "@macrostrat/hyper";
import { PrintArea } from "~/shared/print-area";
import {
  SectionDataProvider,
  wrapWithSections,
} from "~/sections/data-providers";
import { SummarySectionsInner } from "~/sections/summary-sections";

export function Page() {
  return h(
    PrintArea,
    { filename: "stratigraphic-model.pdf" },
    h(SectionDataProvider, h(wrapWithSections(SummarySectionsInner))),
  );
}
