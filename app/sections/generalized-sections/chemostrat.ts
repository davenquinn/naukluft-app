import h from "@macrostrat/hyper";
import {BaseChemostratigraphyColumn} from '../summary-sections/chemostrat'

const ChemostratigraphyColumn = function(props){
  const {
    sections,
    keySection,
    ...rest
  } = props;

  let row = sections[0]
  if (keySection != null) {
    row = sections.find(d => d.key === keySection);
  }

  // We have inserted a shim first surface, so the
  // second surface is actually the secton's base
  const range = [
    row.surfaces[1].original_bottom,
    row.surfaces[row.surfaces.length-1].original_top
  ]

  return h(BaseChemostratigraphyColumn, {...rest, keySection, sections, range});
}

export {ChemostratigraphyColumn};
