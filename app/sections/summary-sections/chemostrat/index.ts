/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import {hyperStyled} from "@macrostrat/hyper";
import {
  ColumnProvider,
  useSettings
} from "@macrostrat/column-components";
import styles from "../main.styl";
import T from 'prop-types';
import {
  IsotopesColumn,
  MinimalIsotopesColumn
} from './carbon-isotopes';
import {rangeForSection} from '../../util';
import {LayoutGroup} from "../layout";

const h = hyperStyled(styles);

const ChemostratigraphyGroup = function(props){
  const {range, children} = props;
  return h(LayoutGroup, {
    name: null,
    className: 'chemostratigraphy'
  }, (
    h(ColumnProvider, {
      range,
      zoom: 0.1
    }, children)
  )
  );
};

const BaseChemostratigraphyColumn = (props)=>{
  const {
    sections,
    surfaces,
    colorScheme,
    range,
    showLines,
    keySection
  } = props;
  const {
    correctIsotopeRatios,
    showCarbonIsotopes,
    showOxygenIsotopes
  } = useSettings();

  if (!showCarbonIsotopes && !showOxygenIsotopes) { return null; }

  let row = sections[0]
  if (keySection != null) {
    row = sections.find(d => d.id === keySection);
  }
  const offset = row?.offset ?? 0
  const {location, ...rest} = row;

  return h(ChemostratigraphyGroup, {
    range
  }, [
    h.if(showCarbonIsotopes)(IsotopesColumn, {
      zoom: 0.1,
      key: 'carbon-isotopes',
      offset,
      location: "",
      surfaces,
      colorScheme,
      corrected: correctIsotopeRatios,
      showLines,
      ...rest
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
      ...rest
    })
  ]);
}

const ChemostratigraphyColumn = function(props){
  const {
    sections,
    surfaces,
    colorScheme,
    range,
    showLines,
    keySection
  } = props;


  let row = sections[0]
  if (keySection != null) {
    row = sections.find(d => d.id === keySection);
  }
  const offset = row?.offset ?? 0
  const {location, ...rest} = row;

  return h(BaseChemostratigraphyColumn, {
    range: rangeForSection(row),
    ...props
  })
};

ChemostratigraphyColumn.defaultProps = {
  keySection: 'J',
  showLines: true
}

ChemostratigraphyColumn.propTypes = {
  showLines: T.bool
};


export {
  IsotopesColumn,
  MinimalIsotopesColumn,
  ChemostratigraphyColumn,
  ChemostratigraphyGroup
};
