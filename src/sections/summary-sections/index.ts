import h, { compose } from "@macrostrat/hyper";
import { SectionPositionProvider } from "../components";
import { SectionPane } from "./section-pane";
import { BaseSectionPage } from "../components";
import { EditorProvider } from "./editor";
import { SummarySectionsSettings, defaultSettings } from "./settings";

function SummarySections({
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

export { SummarySectionsInner, SummarySections, SectionPane };
