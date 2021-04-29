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
import {useSurfaces} from '~/sections/providers'

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
  const offset = row?.offset ?? props.offset ?? 0
  const {location, ...rest} = row ?? {};

  const surfaces = useSurfaces()

  return h(ChemostratigraphyGroup, {
    range
  }, [
    h.if(showCarbonIsotopes)(IsotopesColumn, {
      ...rest,
      zoom: 0.1,
      key: 'carbon-isotopes',
      offset,
      location: "",
      surfaces,
      colorScheme,
      corrected: correctIsotopeRatios,
      showLines,
      keySection
    }),
    h.if(showOxygenIsotopes)(IsotopesColumn, {
      ...rest,
      zoom: 0.1,
      system: 'delta18o',
      label: 'δ¹⁸O',
      domain: [-15,2],
      key: 'oxygen-isotopes',
      colorScheme,
      corrected: correctIsotopeRatios,
      offset,
      location: "",
      surfaces,
      showLines,
      keySection
    })
  ]);
}

const ChemostratigraphyColumn = function(props){
  const {
    sections,
    keySection
  } = props;


  let row = sections[0]
  if (keySection != null) {
    row = sections.find(d => d.id === keySection);
  }
  const offset = row?.offset ?? 0

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
  BaseChemostratigraphyColumn,
  ChemostratigraphyGroup
};
