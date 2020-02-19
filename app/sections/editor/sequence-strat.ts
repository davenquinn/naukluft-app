/*
 * decaffeinate suggestions:
 * DS001: Remove Babel/TypeScript constructor workaround
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import {Tabs, Tab, Slider} from "@blueprintjs/core";

import {PickerControl} from "@macrostrat/column-components/dist/cjs/editor/picker-base";
import {LabeledControl} from "@macrostrat/column-components/dist/cjs/editor/util";

import {
  SurfaceOrderSlider
} from '@macrostrat/column-components/dist/cjs/editor/controls';

import {hyperStyled} from "@macrostrat/hyper";
import styles from "./style.styl";
const h = hyperStyled(styles);

const surfaceTypes = [
  {value: 'mfs', label: 'Maximum flooding surface'},
  {value: 'sb', label: 'Sequence boundary'}
];

const faciesTransitions = [
  {value: 1, label: 'Flooding (transgression)'},
  {value: -1, label: 'Shallowing (regression)'}
];

const Panel = (props)=>h('div.tab-panel', props)


const SurfaceTypeControls = (props)=>{
  const {interval, updateInterval} = props
  return h(Panel, [
    h(LabeledControl, {
      title: 'Surface type',
      is: PickerControl,
      vertical: false,
      isNullable: true,
      states: surfaceTypes,
      activeState: interval.surface_type,
      onUpdate: surface_type => updateInterval({surface_type})
    }),
    h(LabeledControl, {
      title: 'Surface order',
      is: SurfaceOrderSlider,
      interval,
      onChange: updateInterval
    })
  ])
}

const FaciesTransitionsControls = (props)=>{
  const {interval, updateInterval} = props

  const {flooding_surface_order} = interval

  const ix = Math.sign(flooding_surface_order)

  return h(Panel, [
    h(LabeledControl, {
      title: 'Facies transition',
      is: PickerControl,
      vertical: false,
      isNullable: true,
      states: faciesTransitions,
      activeState: ix,
      onUpdate: ix=> {
        if (ix == null) updateInterval({flooding_surface_order: null})
        const newOrder = ix*Math.abs(flooding_surface_order)
        return updateInterval({flooding_surface_order: newOrder});
      }
    }),
    h(LabeledControl, {
      title: 'Importance',
      is: Slider,
      min: 1,
      max: 5,
      disabled: flooding_surface_order == null,
      stepSize: 1,
      value: Math.abs(flooding_surface_order ?? 5),
      showTrackFill: false,
      onChange: num => updateInterval({flooding_surface_order: ix*num})
    })
  ])
}

const SequenceStratControls = (props)=>{
  const {interval, updateInterval, children} = props
  return h(Tabs, {id: 'sequence-strat-controls', large: false}, [
    h(Tab, {
      id: 'new',
      panel: h(SurfaceTypeControls, {interval, updateInterval})
  }, "Sequence stratigraphy"),
    h(Tab, {
      id: 'old',
      panel: h(FaciesTransitionsControls, {interval, updateInterval})
    }, "Facies trends"),
    children
  ])
}


export {SequenceStratControls};
