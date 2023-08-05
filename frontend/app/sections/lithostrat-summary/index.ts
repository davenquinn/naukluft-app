import h from "@macrostrat/hyper";
import { SectionPane } from "./column";
import { ErrorBoundary } from "@macrostrat/ui-components";
import classNames from "classnames";
import { NavigationControl } from "~/components";

function LithostratigraphicSummaryColumn(props) {
  const { settingsPanel, ...rest } = props;
  return h(BaseSectionPage, { id: "summary-sections" }, [
    h(SectionPane, {
      groupMargin: 400,
      columnMargin: 100,
      columnWidth: 150,
      ...rest,
    }),
  ]);
}

function BaseSectionPage(props: any) {
  let { children, id, className } = props;
  // State to control whether we show settings panel

  className = classNames(className, id);

  return h("div.page.section-page", { className }, [
    h("div.left-panel", [
      h("div.panel-container", [
        h(NavigationControl),
        h(ErrorBoundary, null, children),
      ]),
    ]),
  ]);
}

export { LithostratigraphicSummaryColumn };
