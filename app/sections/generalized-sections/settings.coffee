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
  showLithology: true
  showGrainsize: true
  showFaciesTracts: false
  showSimplifiedLithology: true
  showSequenceStratigraphy: true
}

GeneralizedSectionSettings = ->
  h BaseSettingsPanel, [
    h 'h5', "Components"
    h SettingsSwitch, {id: 'showSequenceStratigraphy', label: "Sequence-stratigraphic correlations"}
    h SettingsSwitch, {id: 'showLithology', label: "Simplified lithology"}
    h SettingsSwitch, {id: 'showFacies', label: "Facies"}
    h SettingsSwitch, {id: 'showFaciesTracts', label: 'Facies tracts'}
    h 'hr'
    h SequenceStratControlPanel
    h 'div', [
      h 'h5', "Backend"
      h SerializedQueriesControl
    ]
  ]

export {
  GeneralizedSectionSettings,
  defaultSettings
  useSettings
}
