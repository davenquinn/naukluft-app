/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import {SettingsPanel} from "../settings";
import {Button, Slider} from "@blueprintjs/core";
import h from "react-hyperscript";
import {
  useSettings,
  updateSettings
} from '@macrostrat/column-components';
import {
  BaseSettingsPanel,
  SettingsSwitch,
  SequenceStratControlPanel,
  EditModeControl,
  SerializedQueriesControl
} from '../settings';

const defaultSettings = {
  showFacies: true,
  showSymbols: true,
  showLithology: true,
  showGrainsize: true,
  showFaciesTracts: false,
  showSimplifiedLithology: true,
  showSequenceStratigraphy: true,
  showCarbonIsotopes: true,
  showOxygenIsotopes: true
};

const GeneralizedSectionSettings = ({isOpen}) => h(BaseSettingsPanel, {isOpen}, [
  h('h3', "Components"),
  h(SettingsSwitch, {id: 'showSequenceStratigraphy', label: "Sequence-stratigraphic correlations"}),
  h(SettingsSwitch, {id: 'showLithology', label: "Lithology patterns"}),
  h(SettingsSwitch, {id: 'showFacies', label: "Facies"}),
  h(SettingsSwitch, {id: 'showFaciesTracts', label: 'Facies tracts'}),
  h(SequenceStratControlPanel),
  h('div', [
    h('h3', "Backend"),
    h(SerializedQueriesControl)
  ])
]);

export {
  GeneralizedSectionSettings,
  defaultSettings,
  useSettings
};
