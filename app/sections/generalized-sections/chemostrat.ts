import h from "@macrostrat/hyper";
import {
  useSettings
} from "@macrostrat/column-components";
import T from 'prop-types';
import {
  IsotopesColumn,
  MinimalIsotopesColumn
} from '../summary-sections/chemostrat/carbon-isotopes';
import {ChemostratigraphyGroup} from '../summary-sections/chemostrat'

const ChemostratigraphyColumn = function(props){
  const {
    sections,
    colorScheme,
    showLines,
    keySection
  } = props;
  const {correctIsotopeRatios, showCarbonIsotopes, showOxygenIsotopes} = useSettings();

  const surfaces = [];

  if (!showCarbonIsotopes && !showOxygenIsotopes) { return null; }

  let row = sections[0]
  if (keySection != null) {
    row = sections.find(d => d.key === keySection);
  }
  const offset = row?.offset ?? 0

  // We have inserted a shim first surface, so the
  // second surface is actually the secton's base
  const range = [
    row.surfaces[1].original_bottom,
    row.surfaces[row.surfaces.length-1].original_top
  ]

  return h(ChemostratigraphyGroup, {range}, [
    h.if(showCarbonIsotopes)(IsotopesColumn, {
      zoom: 0.1,
      key: 'carbon-isotopes',
      offset,
      location: "",
      surfaces,
      colorScheme,
      corrected: correctIsotopeRatios,
      showLines,
    }),
    h.if(showOxygenIsotopes)(IsotopesColumn, {
      zoom: 0.1,
      system: 'delta18o',
      label: 'δ¹⁸O',
      domain: [-15,4],
      key: 'oxygen-isotopes',
      colorScheme,
      corrected: correctIsotopeRatios,
      offset,
      location: "",
      surfaces,
      showLines,
    })
  ]);
};

ChemostratigraphyColumn.defaultProps = {
  keySection: 'J'
}

ChemostratigraphyColumn.propTypes = {
  showLines: T.bool
};


export {
  IsotopesColumn,
  MinimalIsotopesColumn,
  ChemostratigraphyColumn
};
