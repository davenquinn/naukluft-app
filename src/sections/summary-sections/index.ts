import h, { compose } from "@macrostrat/hyper";
import { SectionPositionProvider } from "../components";
import { SectionPane } from "./section-pane";
import { BaseSectionPage } from "../components";
import { EditorProvider } from "./editor";
import { SummarySectionsSettings, defaultSettings } from "./settings";

function SummarySectionsBase({
  showNavigationController = true,
  settingsPanel = SummarySectionsSettings,
  ...rest
}) {
  return h(
    BaseSectionPage,
    {
      id: "summary-sections",
      settingsPanel,
      defaultSettings,
    },
    [
      h(SectionPane, {
        groupMargin: 400,
        columnMargin: 100,
        columnWidth: 150,
        showNavigationController,
        ...rest,
      }),
    ],
  );
}

const SummarySections = compose(
  SectionPositionProvider,
  EditorProvider,
  SummarySectionsBase,
);

export { SummarySections, SummarySectionsBase, SectionPane };
