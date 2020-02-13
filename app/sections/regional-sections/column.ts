/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import {hyperStyled} from "@macrostrat/hyper";
import T from 'prop-types';
import {
  ColumnSVG,
  ColumnBox,
  ColumnProvider
} from '@macrostrat/column-components';
import {
  ColumnTracker
} from '../components/link-overlay';
import {
  LithologyColumn,
  ParameterIntervals,
} from "@macrostrat/column-components/dist/esm/lithology";
import {useFaciesColors} from './util';

import styles from './main.styl';
const h = hyperStyled(styles);

const FaciesTractIntervals = function(props){
  const colorIndex = useFaciesColors();
  return h(ParameterIntervals, {
    parameter: 'facies_tract',
    fillForInterval(facies_tract, d){
      if (facies_tract == null) { return null; }
      return colorIndex[facies_tract];
    },
    ...props
  });
};

const SVGSectionInner = function(props){
  let {id,
   range,
   zoom,
   offsetTop,
   divisions,
   children,
   topSurface,
   bottomSurface
   } = props;

  divisions = divisions.filter(d => !d.schematic);

  if (bottomSurface != null) {
    const {bottom: bottomHeight} = divisions.find(d => d.surface === bottomSurface);
    range[0] = bottomHeight;
  }
  if (topSurface != null) {
    const {bottom: topHeight} = divisions.find(d => d.surface === topSurface);
    range[1] = topHeight;
  }
  const height = range[1]-range[0];

  divisions = divisions.filter(d => (range[0] <= d.top) && (d.bottom <= range[1]));

  // Expand SVG past bounds of section

  const domID = `column-${id}`;

  return h(ColumnProvider, {
    range,
    height,
    zoom,
    divisions
  }, [
    h(ColumnBox, {
      offsetTop,
      width: 40,
      absolutePosition: false
    }, [
      h(ColumnTracker, {
        className: 'section-outer',
        id,
        padding: 5
      }, [
        h(ColumnSVG, {
          width: 30,
          padding: 5
        }, [
          h(LithologyColumn, {width: 20}, [
            h(FaciesTractIntervals)
            //h CarbonateDivisions, {minimumHeight: 2}
          ])
        ]),
        children
      ])
    ])
  ]);
};


SVGSectionInner.defaultProps = {
  offsetTop: null,
  marginTop: null,
  topSurface: null,
  bottomSurface: null
};

SVGSectionInner.propTypes = {
  //inEditMode: T.bool
  range: T.arrayOf(T.number).isRequired,
  absolutePosition: T.bool,
  offsetTop: T.number
};

const FaciesSection = function(props){
  const {id, divisions} = props;

  return h('div.section-column', {className: id}, [
    h(SVGSectionInner, {divisions, ...props})
  ]);
};

export {FaciesSection};
