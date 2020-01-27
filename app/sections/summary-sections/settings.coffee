import {Button, Slider} from "@blueprintjs/core"
import h from "react-hyperscript"
import {
  SettingsProvider as BaseSettingsProvider,
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
  modes: [
    {value: 'normal', label: 'Normal'}
    {value: 'skeleton', label: 'Skeleton'}
  ]
  showNavigationController: true
  activeMode: 'normal'
  showLegend: true
  showFacies: true
  showSymbols: true
  showLithology: true
  showGrainsize: true
  showFaciesTracts: false
  # Allows us to test the serialized query mode
  # we are developing for the web
  serializedQueries: global.SERIALIZED_QUERIES
  condensedDisplay: true
  sectionIDs: []
  showLithostratigraphy: true
  showSequenceStratigraphy: true
  showTriangleBars: true
  showCarbonIsotopes: true
  isotopesPerSection: false
  correctIsotopeRatios: false
  interactive: true
}

SettingsProvider = (props)->
  {children, overrides...} = props
  localStorageID = "summary-section-component"
  h BaseSettingsProvider, {
    localStorageID,
    defaultSettings...
    overrides...
  }, children


SummarySectionsSettings = ({isOpen, onClose})->
  h BaseSettingsPanel, {isOpen, onClose}, [
    h 'h3', "Components"
    h SettingsSwitch, {id: 'showCarbonIsotopes', label: "Carbon isotopes"}
    h SettingsSwitch, {id: 'showOxygenIsotopes', label: "Oxygen isotopes"}
    h SettingsSwitch, {id: 'isotopesPerSection', label: "Show isotopes for each section"}
    h SettingsSwitch, {id: 'correctIsotopeRatios', label: "Experimental standard correction"}
    h SettingsSwitch, {id: 'showLithostratigraphy', label: "Lithostratigraphic correlations"}
    h SettingsSwitch, {id: 'showSequenceStratigraphy', label: "Sequence-stratigraphic correlations"}
    h SettingsSwitch, {id: 'showFacies', label: "Facies"}
    h SettingsSwitch, {id: 'showFaciesTracts', label: "Facies tracts"}
    h SettingsSwitch, {id: 'showLithology', label: 'Lithology patterns'}
    h SettingsSwitch, {id: 'showGrainsize', label: 'Grainsize scale'}
    h SettingsSwitch, {id: 'showSymbols', label: 'Symbols'}
    h SettingsSwitch, {id: 'showNotes', label: "Notes"}
    h SettingsSwitch, {id: 'showLegend', label: "Legend"}
    h SequenceStratControlPanel
    h 'div', [
      h 'h3', "Backend"
      h EditModeControl
      h SerializedQueriesControl
    ]
  ]
export {SettingsProvider, useSettings, updateSettings,
        SummarySectionsSettings, defaultSettings}
