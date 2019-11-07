import h from 'react-hyperscript'
import {
  SettingsProvider as BaseSettingsProvider,
  useSettings,
  updateSettings
} from '#'

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

export {SettingsProvider, useSettings, updateSettings}
