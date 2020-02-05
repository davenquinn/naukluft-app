import h from 'react-hyperscript'
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
  zoom: 1
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
  condensedDisplay: true
  sectionIDs: []
  showCarbonIsotopes: false
}

SettingsProvider = (props)->
  {children, overrides...} = props
  localStorageID = "section-component"
  h BaseSettingsProvider, {
    localStorageID,
    defaultSettings...
    overrides...
  }, children


SettingsPanel = ({isOpen, onClose})->
  h BaseSettingsPanel, {isOpen, onClose}, [
    h 'h3', "Components"
    h SettingsSwitch, {id: 'showCarbonIsotopes', label: "Carbon isotopes"}
    h SettingsSwitch, {id: 'showFacies', label: "Facies"}
    h SettingsSwitch, {id: 'showFaciesTracts', label: "Facies tracts"}
    h SettingsSwitch, {id: 'showSymbols', label: 'Symbols'}
    h SettingsSwitch, {id: 'showNotes', label: "Notes"}
    h SequenceStratControlPanel
    h 'div', [
      h 'h3', "Backend"
      h EditModeControl
      h SerializedQueriesControl
    ]
  ]

export {SettingsPanel, defaultSettings}
