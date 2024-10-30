/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import { useContext } from "react";
import h from "@macrostrat/hyper";

import { SectionComponent } from "./column";
import { PlatformContext } from "~/platform";
import { BaseSectionPage } from "../components";
import { defaultSettings, SettingsPanel } from "./settings";
import { useSettings } from "@macrostrat/column-components";

import "../main.styl";
import "./main.module.styl";

const SectionMain = function(props) {
  // Set up routing to jump to a specific height
  const { children } = props;
  const { inEditMode } = useContext(PlatformContext);
  const settings = useSettings();

  return h(SectionComponent, {
    ...props,
    isEditable: inEditMode,
    ...settings,
    children
  });
};

const SectionPage = function(props) {
  // Set up routing to jump to a specific height
  const { section, height: scrollToHeight } = props;

  return h(
    BaseSectionPage,
    {
      defaultSettings,
      id: "single-section",
      settingsPanel: SettingsPanel
    },
    [
      h(SectionMain, {
        ...section,
        scrollToHeight,
        offsetTop: 0,
        key: section.id
      })
    ]
  );
};

export default SectionPage;
