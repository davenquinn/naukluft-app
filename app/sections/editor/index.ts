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
import {Drawer, Button, Intent, ButtonGroup, Switch} from "@blueprintjs/core";
import {DeleteButton} from '@macrostrat/ui-components';
import {format} from "d3-format";

import {FaciesContext} from "@macrostrat/column-components";
import {PickerControl} from "@macrostrat/column-components/dist/cjs/editor/picker-base";
import {LabeledControl, IntervalEditorTitle} from "@macrostrat/column-components/dist/cjs/editor/util";

import {ColumnDivision, ColumnDivisionsContext} from "../column/data-source";
import {
  LithologyPicker,
  LithologySymbolPicker,
} from '@macrostrat/column-components/dist/cjs/editor/lithology-picker';
import {
  SurfaceOrderSlider,
  BoundaryStyleControl,
  RaisedSelect
} from '@macrostrat/column-components/dist/cjs/editor/controls';
import {
  CorrelatedSurfaceControl,
  DivisionNavigationControl,
  Direction
} from './controls';
import {FaciesPicker} from '@macrostrat/column-components/dist/cjs/editor/facies/picker';
import {SequenceStratControls} from './sequence-strat'

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

const LithologyControls = function(props){
  const {interval, update} = props;
  return h([
    h(LabeledControl, {
      title: "Lithology",
      is: LithologyPicker,
      interval,
      onChange: lithology=> update({lithology})
    }),
    h(LithologySymbolPicker, {
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

const updateIntervalQuery = async function(id, columns){
  const {TableName, update} = helpers;
  const tbl = new TableName("section_lithology", "section");

  let s = helpers.update(columns, null, tbl);
  s += ` WHERE id=${id}`;
  console.log(s);
  return await db.none(s);
};

interface EditorProps {
  moveCursor(dir: Direction): void,
  interval: ColumnDivision,
  height: number,
  section: string
}

const EditorInner = (props: EditorProps)=>{

  const {interval, height, section} = props;
  const {id, facies} = interval;
  const hgt = fmt(height);
  const txt = `interval starting at ${hgt} m`;

  const updateInterval = async columns => {
    await updateIntervalQuery(props.interval.id, columns);
    return props.onUpdate();
  };

  if (interval == null) return null

  return h('div.editor-inner', [
    h(IntervalEditorTitle, {
      title: `Section ${section}`,
      interval
    }),
    h(DivisionNavigationControl, {
      moveCursor: props.moveCursor,
      editingInterval: interval.id
    }),
    h(LithologyControls, {
      interval,
      update: updateInterval
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
        return updateInterval({grainsize});
      }
    }),
    h(Switch, {
      label: 'Covered',
      checked: interval.covered,
      onChange: d=> {
        return updateInterval({covered: !interval.covered});
      }
    }),
    h(LabeledControl, {
      title: 'Surface expression',
      is: BoundaryStyleControl,
      interval,
      onUpdate: d=> updateInterval({definite_boundary: d})
    }),
    h(LabeledControl, {
      title: 'Facies',
      is: FaciesPicker,
      interval,
      onChange: facies=> updateInterval({facies})
    }),
    h(LabeledControl, {
      title: 'Facies tract',
      is: FaciesTractControl,
      interval,
      onUpdate: option=> {
        const facies_tract = option.value;
        return updateInterval({facies_tract});
      }
    }),
    h(SequenceStratControls, {updateInterval, interval}),
    h(LabeledControl, {
      title: 'Correlated surface',
      is: CorrelatedSurfaceControl,
      interval,
      onChange: updateInterval
    }),
    h(ButtonGroup, [
      h(DeleteButton, {
        itemDescription: "the "+txt,
        handleDelete: () => {
          if (props.removeInterval == null) return
          return props.removeInterval(id);
        }
      }, "Delete this interval"),
      h(Button, {
        onClick: () => {
          if (props.addInterval == null) return
          return props.addInterval(height);
        }
      }, `Add division at ${fmt(height)} m`)
    ]),
  ])
}



const ModalEditor = (props: ModalEditorProps)=>{
  const {
    interval,
    section,
    isOpen,
    closeDialog,
    ...rest
  } = props;

  return h(Drawer, {
    className: "bp3-minimal editor-drawer",
    title: "Edit interval",
    isOpen,
    hasBackdrop: false,
    enforceFocus: false,
    canOutsideClickClose: false,
    onClose: closeDialog
  }, [
    h(EditorInner, {interval, section, ...rest})
  ]);
}

ModalEditor.defaultProps = {onUpdate() {}}

class IntervalEditor extends Component {
  constructor(...args) {
    super(...args)
    this.updateFacies = this.updateFacies.bind(this);
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

export {Direction}
export {ModalEditor, IntervalEditor};
