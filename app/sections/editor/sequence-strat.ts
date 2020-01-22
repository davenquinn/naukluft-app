/*
 * decaffeinate suggestions:
 * DS001: Remove Babel/TypeScript constructor workaround
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let helpers;
import {Component, useContext} from "react";
import {Dialog, Button, Intent, ButtonGroup, Alert, Slider, Switch} from "@blueprintjs/core";
import {DeleteButton} from '@macrostrat/ui-components';
import {format} from "d3-format";

import {FaciesContext} from "@macrostrat/column-components";
import {PickerControl} from "@macrostrat/column-components/dist/cjs/editor/picker-base";
import {LabeledControl, IntervalEditorTitle} from "@macrostrat/column-components/dist/cjs/editor/util";

import {ColumnDivisionsContext} from "../column/data-source";
import {
  LithologyPicker,
  LithologySymbolPicker,
} from '@macrostrat/column-components/dist/cjs/editor/lithology-picker';
import {
  SurfaceOrderSlider,
  BoundaryStyleControl,
  RaisedSelect
} from '@macrostrat/column-components/dist/cjs/editor/controls';
import {CorrelatedSurfaceControl} from './controls';
import {FaciesPicker} from '@macrostrat/column-components/dist/cjs/editor/facies/picker';

import {grainSizes} from "@macrostrat/column-components/dist/cjs/grainsize";
import {dirname} from "path";
import {hyperStyled} from "@macrostrat/hyper";
import styles from "./style.styl";
const h = hyperStyled(styles);

import {db, storedProcedure, query} from "~/sections/db";

const baseDir = dirname(require.resolve('..'));
const sql = id => storedProcedure(id, {baseDir});
try {
  ({helpers} = require('~/db/backend'));
} catch (error) {
  ({});
}

const floodingSurfaceOrders = [-1,-2,-3,-4,-5,null,5,4,3,2,1];

const surfaceTypes = [
  {value: 'mfs', label: 'Maximum flooding surface'},
  {value: 'sb', label: 'Sequence boundary'}
];

const SequenceStratControls = (props)=>{
  const {interval, updateInterval} = props

  return h('div.sequence-strat', [
    h(LabeledControl, {
      title: 'Surface type',
      is: PickerControl,
      vertical: false,
      isNullable: true,
      states: surfaceTypes,
      activeState: interval.surface_type,
      onUpdate: surface_type=> {
        return updateInterval({surface_type});
      }
    }),
    h(LabeledControl, {
      title: 'Surface order',
      is: SurfaceOrderSlider,
      interval,
      onChange: updateInterval
    }),
    h(LabeledControl, {
      title: 'Flooding surface (negative is regression)',
      is: PickerControl,
      vertical: false,
      isNullable: true,
      states: floodingSurfaceOrders.map(function(d){
        let lbl = `${d}`;
        if ((d == null)) { lbl = 'None'; }
        return {label: d, value: d};}),
      activeState: interval.flooding_surface_order,
      onUpdate: flooding_surface_order=> {
        return updateInterval({flooding_surface_order});
      }
    })
  ])
}


export {SequenceStratControls};
