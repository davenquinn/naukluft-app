/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import terrainQuery from './get-terrain.sql';
import intersectionsQuery from './unit-intersections.sql';
import {SVG, expandInnerSize} from '@macrostrat/column-components';

import {useQuery} from '~/db';
import {useDarkMode} from '~/platform';
import {NavigationControl} from '~/components';
import {scaleLinear} from 'd3-scale';
import {line} from 'd3-shape';

import {hyperStyled} from '@macrostrat/hyper';
import styles from './main.styl';
const h = hyperStyled(styles);

const Intersections = function(props){
  const {section} = props;
  const res = useQuery(intersectionsQuery, {section});
  if (res != null) {
    console.log(res);
  }

  return h('path.unit-intersections');
};

const CrossSection = function(props){
  const {geometry, heightRange} = props;
  const {coordinates} = geometry;

  const metersPerPixel = 10;

  const scaleHeight = function(d){
    const height = d[1];
    const heightOffset = heightRange[1]-height;
    return heightOffset/metersPerPixel;
  };

  const innerHeight = (heightRange[1]-heightRange[0])/metersPerPixel;
  const innerWidth = coordinates[coordinates.length-1][0]/metersPerPixel;
  const padding = 20;

  const {width, height} = expandInnerSize({
    innerHeight,
    innerWidth,
    padding
  });

  const pathGenerator = line()
    .x(d => d[0]/metersPerPixel)
    .y(scaleHeight);

  const d = pathGenerator(coordinates);


  return h(SVG, {width, height}, [
    h('g', {transform: `translate(${padding},${padding})`}, [
      h('path.terrain', {d})
    ])
  ]);
};

const CrossSectionsPage = function() {
  // State management
  const res = useQuery(terrainQuery);

  const darkMode = useDarkMode();
  const className = darkMode ? "dark-mode" : null;
  return h('div.cross-sections', {className}, [
    h(NavigationControl),
    h('div.inner', res.map(function(d){
      const {geometry, ymin, ymax} = d;
      const heightRange = [ymin, ymax];
      return h('div', [
        h('h3', d.name),
        h(CrossSection, {geometry, heightRange})
      ]);}))
  ]);
};

export {CrossSectionsPage};
