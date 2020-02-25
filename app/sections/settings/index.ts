/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import {Component, useContext} from "react";
import h from "@macrostrat/hyper";
import {CSSTransition} from "react-transition-group";
import {Switch, RangeSlider, Button} from "@blueprintjs/core";
import {PlatformContext} from "../../platform";
import {PickerControl} from "@macrostrat/column-components/dist/esm/editor/picker-base";
import {SequenceStratContext} from "../sequence-strat-context";
import {AppDrawer} from '~/components';
import classNames from "classnames";
import {useSettings, updateSettings} from '@macrostrat/column-components';
import T from 'prop-types';
import "./main.styl";

const SettingsSwitch = function({id, label}){
  const settings = useSettings();
  const checked = settings[id];
  const onChange = updateSettings(() => ({
    [id]: {$set: !checked}
  }));

  return h(Switch, {
    checked,
    label,
    key: id,
    onChange
  });
};

const SettingsPicker = ({id, options})=> {
  const settings = useSettings();
  const onUpdate = updateSettings(value=> ({[id]: {$set: value}}));
  return h(PickerControl, {
    states: options,
    activeState: settings[id],
    onUpdate
  });
};

const OptionsShape = T.shape({
  value: T.string.isRequired,
  label: T.string.isRequired
});

SettingsPicker.propTypes = {
  id: T.string.isRequired,
  options: T.arrayOf(OptionsShape).isRequired
};

const EditModeControl = function(props){
  const {WEB, inEditMode, updateState} = useContext(PlatformContext);
  return h(Switch, {
    checked: inEditMode,
    label: 'Allow editing',
    key: 'edit-mode',
    onChange() { return updateState({inEditMode: !inEditMode}); }
  });
};

const SerializedQueriesControl = function(props){
  const {WEB, serializedQueries, updateState} = useContext(PlatformContext);
  if (WEB) { return null; }
  return h(Switch, {
    checked: serializedQueries,
    label: 'Serialized queries',
    key: 'serialized-queries',
    onChange() { return updateState({serializedQueries: !serializedQueries}); }
  });
};

const SequenceStratControlPanel = function(props){
  const value = useContext(SequenceStratContext);
  const {actions} = value;
  return h('div', props, [
    h('h3', 'Sequence stratigraphy'),
    h(Switch, {
      checked: value.showFloodingSurfaces,
      label: "Flooding surfaces",
      onChange: actions.toggleBooleanState("showFloodingSurfaces")
    }),
    h(Switch, {
      checked: value.showTriangleBars,
      label: "Triangle bars",
      onChange: actions.toggleBooleanState("showTriangleBars")
    }),
    h(RangeSlider, {
      min: 0,
      max: 5,
      stepSize: 1,
      value: value.sequenceStratOrder,
      onChange(v){
        return actions.updateState({sequenceStratOrder:v});
      }
    })
  ]);
};

const BaseSettingsPanel = function(props){
  let {children, isOpen, onClose} = props;
  if (isOpen == null) { isOpen = false; }

  return h(AppDrawer, {
    isOpen,
    title: 'Settings',
    children,
    onClose
  });
};

export {
  SettingsSwitch,
  SettingsPicker,
  SequenceStratControlPanel,
  SerializedQueriesControl,
  EditModeControl,
  PickerControl,
  BaseSettingsPanel
};
