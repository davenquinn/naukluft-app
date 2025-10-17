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

function SummarySectionsInnerV0(props) {
  return h(SectionPane, {
    groupMargin: 400,
    columnMargin: 100,
    columnWidth: 150,
    ...props,
  });
}

const SummarySectionsInner = compose(
  SectionPositionProvider,
  EditorProvider,
  SummarySectionsInnerV0,
);

export { SummarySectionsInner, SummarySections, SectionPane };
