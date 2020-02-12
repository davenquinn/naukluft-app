/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import {useContext} from 'react';
import {FaciesContext} from '@macrostrat/column-components';

const useFaciesColors = function() {
  const {faciesTracts} = useContext(FaciesContext);
  const colorIndex = {};
  for (let d of Array.from(faciesTracts)) {
    colorIndex[d.id] = d.color;
    if (d.abbreviation != null) {
      if (colorIndex[d.abbreviation] == null) { colorIndex[d.abbreviation] = d.color; }
    }
  }

  return colorIndex;
};

export {useFaciesColors};
