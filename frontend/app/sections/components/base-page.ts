import React, { useState } from "react";
import h from "@macrostrat/hyper";
import T from "prop-types";
import { SectionNavigationControl } from "../util";
import { ErrorBoundary } from "@macrostrat/ui-components";
import { SettingsProvider } from "@macrostrat/column-components";
import classNames from "classnames";

type BaseSectionProps<T> = React.PropsWithChildren<{
  className: string;
  settingsPanel: React.ComponentType<any>;
  defaultSettings: T;
  id: string;
}>;

const BaseSectionPage = function<T>(props: BaseSectionProps<T>) {
  let {
    children,
    id,
    settingsPanel,
    defaultSettings,
    className,
    ...rest
  } = props;
  // State to control whether we show settings panel
  const [showSettings, setShowSettings] = useState(false);
  const toggleSettings = () => setShowSettings(!showSettings);

  className = classNames(className, id);
  console.log(children);

  return h(
    SettingsProvider,
    {
      storageID: id,
      ...defaultSettings
    },
    [
      h("div.page.section-page", { className }, [
        h("div.left-panel", [
          h("div.panel-container", [
            h(SectionNavigationControl, { toggleSettings }),
            h(ErrorBoundary, null, children)
          ])
        ]),
        h(settingsPanel, {
          isOpen: showSettings,
          onClose() {
            return setShowSettings(false);
          }
        })
      ])
    ]
  );
};

BaseSectionPage.propTypes = {
  className: T.string,
  id: T.string.isRequired,
  settingsPanel: T.elementType.isRequired
};

export { BaseSectionPage };
