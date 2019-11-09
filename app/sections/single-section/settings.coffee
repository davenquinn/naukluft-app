import h from 'react-hyperscript'
import {
  SettingsProvider as BaseSettingsProvider,
  useSettings,
  updateSettings
} from '#'
import {
  BaseSettingsPanel,
  SettingsSwitch
  SequenceStratControlPanel
  EditModeControl
  SerializedQueriesControl
} from '../settings'

defaultSettings = {
  zoom: 1
  settingsPanelIsActive: false
  inEditMode: false
  modes: [
    {value: 'normal', label: 'Normal'}
    {value: 'skeleton', label: 'Skeleton'}
    #{value: 'sequence-stratigraphy', label: 'Sequence Strat.'}
  ]
  activeMode: 'normal'
  displayModes: [
    {value: 'image', label: 'Full-resolution'}
    {value: 'generalized', label: 'Generalized'}
  ]
  activeDisplayMode: 'image'
  showNotes: true
  showSymbols: true
  showFacies: true
  showFloodingSurfaces: false
  showTriangleBars: false
  showFaciesTracts: false
  # Allows us to test the serialized query mode
  # we are developing for the web
  serializedQueries: global.SERIALIZED_QUERIES
  dragdealer: false
  condensedDisplay: true
  sectionIDs: []
  showCarbonIsotopes: false
  dragPosition: {x: 500, y: 500}
}

SettingsProvider = (props)->
  {children, overrides...} = props
  localStorageID = "section-component"
  h BaseSettingsProvider, {
    localStorageID,
    defaultSettings...
    overrides...
  }, children


SettingsPanel = ->
  h BaseSettingsPanel, [
    h 'h5', "Components"
    h SettingsSwitch, {id: 'showCarbonIsotopes', label: "Carbon isotopes"}
    h SettingsSwitch, {id: 'showFacies', label: "Facies"}
    h SettingsSwitch, {id: 'showFaciesTracts', label: "Facies tracts"}
    h SettingsSwitch, {id: 'showSymbols', label: 'Symbols'}
    h SettingsSwitch, {id: 'showNotes', label: "Notes"}
    h 'hr'
    h SequenceStratControlPanel
    h 'div', [
      h 'h5', "Backend"
      h EditModeControl
      h SerializedQueriesControl
      h 'hr'
    ]
  ]

export {SettingsPanel, defaultSettings}
