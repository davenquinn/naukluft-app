/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import {useContext} from "react";
import {
  RaisedSelect
} from '@macrostrat/column-components/dist/cjs/editor/controls'
import {
  SectionSurfacesContext
} from '../summary-sections/data-provider'
import h from "react-hyperscript";

const SurfaceLabel = (props)=>{
  const d = props.surface
  if (d == null) return null
  return h("div.correlated-surface-row", [
    h("span.bp3-code", d.surface_id),
    " ",
    h("span", d.note)
  ])
}

const CorrelatedSurfaceControl = (props)=>{
  const {surfaces} = useContext(SectionSurfacesContext)
  const {onChange, interval} = props;

  const seqSurfaces = surfaces.filter(d=>d.type == 'sequence-strat')

  const options = seqSurfaces.map(d => ({
    value: d.surface_id,
    label: h(SurfaceLabel, {surface: d})
  }));

  const value = options.find(d => d.value === interval.surface);

  return h(RaisedSelect, {
    options,
    isClearable: true,
    isSearchable: true,
    name: "selected-state",
    value,
    placeholder: "Choose a surface...",
    onChange: surface=> {
      if (surface != null) {
        surface = surface.value;
      }
      return onChange({surface});
    }
  });
}

export {
  CorrelatedSurfaceControl
};
