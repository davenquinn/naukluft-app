import {SettingsPanel} from "../settings"
import {Button, Slider} from "@blueprintjs/core"
import h from "react-hyperscript"
import {
  useSettings,
  updateSettings
} from '@macrostrat/column-components'
import {
  BaseSettingsPanel,
  SettingsSwitch
  SequenceStratControlPanel
  EditModeControl
  SerializedQueriesControl
} from '../settings'

defaultSettings = {
  settingsPanelIsActive: false
  modes: [
    {value: 'normal', label: 'Normal'}
    {value: 'skeleton', label: 'Skeleton'}
    #{value: 'sequence-stratigraphy', label: 'Sequence Strat.'}
  ]
  showFacies: true
  showSymbols: true
  showLithology: true
  showGrainsize: true
  showFaciesTracts: false
  showSimplifiedLithology: true
  showSequenceStratigraphy: true
}

GeneralizedSectionSettings = ({isOpen})->
  h BaseSettingsPanel, {isOpen}, [
    h 'h3', "Components"
    h SettingsSwitch, {id: 'showSequenceStratigraphy', label: "Sequence-stratigraphic correlations"}
    h SettingsSwitch, {id: 'showLithology', label: "Lithology patterns"}
    h SettingsSwitch, {id: 'showFacies', label: "Facies"}
    h SettingsSwitch, {id: 'showFaciesTracts', label: 'Facies tracts'}
    h SequenceStratControlPanel
    h 'div', [
      h 'h3', "Backend"
      h SerializedQueriesControl
    ]
  ]

export {
  GeneralizedSectionSettings,
  defaultSettings
  useSettings
}
