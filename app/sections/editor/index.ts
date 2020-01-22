/*
 * decaffeinate suggestions:
 * DS001: Remove Babel/TypeScript constructor workaround
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let helpers;
import {findDOMNode} from "react-dom";
import {Component, useContext} from "react";
import {Dialog, Button, Intent, ButtonGroup, Alert, Slider, Switch} from "@blueprintjs/core";
import {DeleteButton} from '@macrostrat/ui-components';
import Select from 'react-select';
import {format} from "d3-format";

import {FaciesDescriptionSmall, FaciesCard} from "@macrostrat/column-components/dist/cjs/editor/facies";
import {FaciesContext, ColumnContext} from "@macrostrat/column-components/dist/cjs/context";
import {PickerControl} from "@macrostrat/column-components/dist/cjs/editor/picker-base";
import {LabeledControl, IntervalEditorTitle} from "@macrostrat/column-components/dist/cjs/editor/util";
//import "react-select/dist/react-select.css"

import {ColumnDivisionsContext} from "../column/data-source";
import {
  LithologyPicker,
  LithologySymbolPicker,
  FillPatternControl
} from '@macrostrat/column-components/dist/cjs/editor/lithology-picker';
import {
  SurfaceOrderSlider,
  HorizontalPicker,
  BoundaryStyleControl,
  RaisedSelect
} from '@macrostrat/column-components/dist/cjs/editor/controls';
import {CorrelatedSurfaceControl} from './controls';
import {FaciesPicker} from '@macrostrat/column-components/dist/cjs/editor/facies/picker';

import {grainSizes} from "@macrostrat/column-components/dist/cjs/grainsize";
import {IntervalShape} from '@macrostrat/column-components/dist/cjs/editor/types';
import T from 'prop-types';
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

const LithologyControls = function(props){
  const {interval, update} = props;
  return h([
    h(LabeledControl, {
      title: "Lithology",
      is: LithologyPicker,
      interval,
      onChange: lithology=> update({lithology})
    }),
    h(LabeledControl, {
      title: 'Lithology symbol',
      is: LithologySymbolPicker,
      interval,
      onChange: d=> update({fillPattern: d})
    })
  ]);
};

const _fmt = format('.2f');
const fmt = function(d){
  let val = _fmt(d);
  for (let i = 0; i < 1; i++) {
    const lastIx = val.length-1;
    if (val[lastIx] !== '0') { return val; }
    val = val.slice(0,lastIx);
  }
  return val;
};


const FaciesTractControl = function(props){
  const {faciesTracts} = useContext(FaciesContext);
  if ((faciesTracts == null)) {
    return null;
  }
  let {interval, onUpdate} = props;
  if (onUpdate == null) { onUpdate = function() {}; }

  const options = faciesTracts.map(d => ({
    value: d.id,
    label: d.name
  }));

  const currentVal = options.find(d => d.value === interval.facies_tract);

  return h(RaisedSelect, {
    id: 'facies-tract-select',
    options,
    isClearable: true,
    value: currentVal,
    onChange(res){
      return onUpdate(res);
    }
  });
};

const updateInterval = async function(id, columns){
  const {TableName, update} = helpers;
  const tbl = new TableName("section_lithology", "section");

  let s = helpers.update(columns, null, tbl);
  s += ` WHERE id=${id}`;
  console.log(s);
  return await db.none(s);
};

class ModalEditor extends Component {
  static initClass() {
    this.defaultProps = {onUpdate() {}};
  }
  constructor(props){
    super(props);
    this.state = {
      facies: [],
      isAlertOpen: false
    };
  }
  render() {
    const {interval, height, section} = this.props;
    if (interval == null) { return null; }
    const {id, top, bottom, facies} = interval;
    const hgt = fmt(height);
    const txt = `interval starting at ${hgt} m`;

    return h(Dialog, {
      className: "bp3-minimal",
      title: h(IntervalEditorTitle, {
        title: `Section ${section}`,
        interval
      }),
      isOpen: this.props.isOpen,
      onClose: this.props.closeDialog,
      style: {top: '10%', zIndex: 3, position: 'relative'}
    }, [
      h('div.bp3-dialog-body', [
        h(LithologyControls, {
          interval,
          update: this.update
        }),
        h(LabeledControl, {
          title: 'Grainsize',
          is: PickerControl,
          vertical: false,
          isNullable: true,
          states: grainSizes.map(d => ({
            label: d,
            value: d
          })),
          activeState: interval.grainsize,
          onUpdate: grainsize=> {
            return this.update({grainsize});
          }
        }),
        h(Switch, {
          label: 'Covered',
          checked: interval.covered,
          onChange: d=> {
            return this.update({covered: !interval.covered});
          }
        }),
        h(LabeledControl, {
          title: 'Surface expression',
          is: BoundaryStyleControl,
          interval,
          onUpdate: d=> this.update({definite_boundary: d})
        }),
        h(LabeledControl, {
          title: 'Facies',
          is: FaciesPicker,
          interval,
          onChange: facies=> this.update({facies})
        }),
        h(LabeledControl, {
          title: 'Facies tract',
          is: FaciesTractControl,
          interval,
          onUpdate: option=> {
            const facies_tract = option.value;
            return this.update({facies_tract});
          }
        }),
        h(LabeledControl, {
          title: 'Surface type',
          is: PickerControl,
          vertical: false,
          isNullable: true,
          states: surfaceTypes,
          activeState: interval.surface_type,
          onUpdate: surface_type=> {
            return this.update({surface_type});
          }
        }),
        h(LabeledControl, {
          title: 'Surface order',
          is: SurfaceOrderSlider,
          interval,
          onChange: this.update
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
            return this.update({flooding_surface_order});
          }
        }),
        h(LabeledControl, {
          title: 'Correlated surface',
          is: CorrelatedSurfaceControl,
          interval,
          onChange: this.update
        }),
        h(ButtonGroup, [
          h(DeleteButton, {
            itemDescription: "the "+txt,
            handleDelete: () => {
              if (this.props.removeInterval == null) { return; }
              return this.props.removeInterval(id);
            }
          }, "Delete this interval"),
          h(Button, {
            onClick: () => {
              if (this.props.addInterval == null) { return; }
              return this.props.addInterval(height);
            }
          }, `Add interval starting at ${fmt(height)} m`)
        ])
      ])
    ]);
  }

  update = async columns=> {
    await updateInterval(this.props.interval.id, columns);
    return this.props.onUpdate();
  };
}
ModalEditor.initClass();

class IntervalEditor extends Component {
  constructor(...args) {
    {
      // Hack: trick Babel/TypeScript into allowing this before super.
      if (false) { super(); }
      let thisFn = (() => { return this; }).toString();
      let thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1];
      eval(`${thisName} = this;`);
    }
    this.updateFacies = this.updateFacies.bind(this);
    super(...args);
  }

  static initClass() {
    this.contextType = ColumnDivisionsContext;
    this.defaultProps = {
      onUpdate() {},
      onNext() {},
      onPrev() {},
      onClose() {}
    };
  }
  render() {
    const {interval, height, section} = this.props;
    if (interval == null) { return null; }
    const {id, top, bottom, facies} = interval;
    const hgt = fmt(height);

    return h('div.interval-editor', [
      h(LabeledControl, {
        title: 'Facies tract',
        is: FaciesTractControl,
        interval,
        onUpdate: option=> {
          const facies_tract = option.value;
          return this.update({facies_tract});
        }
      }),
      h(LabeledControl, {
        title: 'Surface type',
        is: PickerControl,
        vertical: false,
        isNullable: true,
        states: surfaceTypes,
        activeState: interval.surface_type,
        onUpdate: surface_type=> {
          return this.update({surface_type});
        }
      }),
      h(LabeledControl, {
        title: 'Surface order',
        is: SurfaceOrderSlider,
        interval,
        onChange: this.update
      }),
      h(LabeledControl, {
        title: 'Correlated surface',
        is: CorrelatedSurfaceControl,
        interval,
        onChange: this.update
      })
    ]);
  }
  updateFacies(facies){
    const {interval} = this.props;
    let selected = facies.id;
    if (selected === interval.facies) {
      selected = null;
    }
    return this.update({facies: selected});
  }

  update = async columns=> {
    await updateInterval(this.props.interval.id, columns);
    return this.context.updateDivisions();
  };
}
IntervalEditor.initClass();


export {ModalEditor, IntervalEditor};
