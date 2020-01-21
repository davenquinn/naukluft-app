/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import {findDOMNode} from "react-dom";
import {Component, createElement} from "react";
import {DeleteButton} from '@macrostrat/ui-components';
import Select from 'react-select';
import {format} from "d3-format";

import {FaciesDescriptionSmall, FaciesCard} from "./facies";
import {PickerControl} from "./picker-base";
import {FaciesContext, ColumnContext} from "../context";
import {
  RaisedSelect
} from '@macrostrat/column-components/dist/cjs/editor/controls'
import {
  SectionSurfacesContext
} from '../summary-sections/data-provider'
import {FaciesPicker} from './facies/picker';
import {grainSizes} from "../grainsize";
import h from "react-hyperscript";
import styles from "./main.styl";
import T from 'prop-types';
import {IntervalShape} from './types';

const fmt = format('.1f');

class CorrelatedSurfaceControl extends Component {
  static initClass() {
    this.contextType = SectionSurfacesContext;
  }
  render() {
    const {surfaces} = this.context;
    const {onChange, interval} = this.props;

    const options = surfaces.map(d => ({
      value: d.id,
      label: h("div.correlated-surface-row", [
        h("span.bp3-code", d.id),
        " ",
        h("span", d.note)
      ])
    }));

    const value = options.find(d => d.value === interval.surface);

    return h(RaisedSelect, {
      options,
      isClearable: true,
      isSearchable: true,
      name: "selected-state",
      value,
      onChange: surface=> {
        if (surface != null) {
          surface = surface.value;
        }
        return onChange({surface});
      }
    });
  }
}
CorrelatedSurfaceControl.initClass();

export {
  CorrelatedSurfaceControl
};
