import {Component, useContext} from "react"
import h from "react-hyperscript"
import {CSSTransition} from "react-transition-group"
import {Switch, Slider, Button} from "@blueprintjs/core"
import {PlatformContext} from "../../platform"
import {PickerControl} from "#/editor/picker-base"
import {SequenceStratContext} from "../sequence-strat-context"
import classNames from "classnames"
import {useSettings, updateSettings} from '@macrostrat/column-components'
import T from 'prop-types'
import "./main.styl"

SettingsSwitch = ({id, label})->
  settings = useSettings()
  checked = settings[id]
  onChange = updateSettings -> {[id]: {$set: not checked}}

  h Switch, {
    checked
    label: label
    key: id
    onChange
  }

SettingsPicker = ({id, options})=>
  settings = useSettings()
  onUpdate = updateSettings (value)=>{[id]: {$set: value}}
  h PickerControl, {
    states: options
    activeState: settings[id]
    onUpdate
  }

OptionsShape = T.shape {
  value: T.string.isRequired
  label: T.string.isRequired
}

SettingsPicker.propTypes = {
  id: T.string.isRequired
  options: T.arrayOf(OptionsShape).isRequired
}

EditModeControl = (props)->
  {WEB, inEditMode, updateState} = useContext(PlatformContext)
  h Switch, {
    checked: inEditMode
    label: 'Allow editing'
    key: 'edit-mode'
    onChange: -> updateState {inEditMode: not inEditMode}
  }

SerializedQueriesControl = (props)->
  {WEB, serializedQueries, updateState} = useContext(PlatformContext)
  return null if WEB
  h Switch, {
    checked: serializedQueries
    label: 'Serialized queries'
    key: 'serialized-queries'
    onChange: -> updateState {serializedQueries: not serializedQueries}
  }

SequenceStratControlPanel = (props)->
  value = useContext(SequenceStratContext)
  {actions} = value
  h 'div', props, [
    h 'h5', 'Sequence stratigraphy'
    h Switch, {
      checked: value.showFloodingSurfaces
      label: "Flooding surfaces"
      onChange: actions.toggleBooleanState("showFloodingSurfaces")
    }
    h Switch, {
      checked: value.showTriangleBars
      label: "Triangle bars"
      onChange: actions.toggleBooleanState("showTriangleBars")
    }
    h Slider, {
      min: 0,
      max: 5,
      stepSize: 1,
      showTrackFill: false,
      value: value.sequenceStratOrder
      onChange: (v)->
        actions.updateState({sequenceStratOrder:v})
    }
  ]

BaseSettingsPanel = (props)->
  {children} = props
  h CSSTransition, {
    classNames: "settings"
    timeout: {exit: 1000, enter: 1000}
  }, [
    h 'div#settings.settings', {key: 'settings'}, [
      h 'h2', 'Settings'
      h 'hr'
      children
    ]
  ]


export {
  SettingsSwitch
  SettingsPicker
  SequenceStratControlPanel
  SerializedQueriesControl
  EditModeControl
  PickerControl
  BaseSettingsPanel
}
