/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */

// https://pomax.github.io/bezierjs/
// http://jsfiddle.net/halfsoft/Gsz2a/

import {Component, useContext, useState, useEffect} from 'react';
import {findDOMNode} from 'react-dom';
import h from '@macrostrat/hyper';
import {SVG} from '@macrostrat/column-components';
import {SectionNavigationControl} from '../util';
import {path} from 'd3-path';
import {schemeSet3} from 'd3-scale-chromatic';
import {geoPath, geoTransform} from 'd3-geo';
import {select} from 'd3-selection';
import {join} from 'path';
import {db, storedProcedure} from '../db';
import './main.styl';
import {PlatformContext} from '../../platform';
import {
  PolygonTopology,
  extractTextPositions,
  extractLines,
  removeLines
} from '../components/polygon-topology';
import {useAsyncEffect} from 'use-async-effect';
import stratModel from "./stratigraphic-model.svg";

const coordAtLength = function(path, pos){
  let {x,y} = path.getPointAtLength(pos);
  x = Math.round(x*10)/10;
  y = Math.round(y*10)/10;
  return [x,y];
};

const facies_ix = {
  shale: [620, '#DCEDC8'],
  gs: [627, '#4A148C'],
  ms: [642, '#BBDEFB'],
  cc: [601,'#006064'],
  fc: [669,'#4DB6AC']
};

const PatternDefs = function({patterns, size}){
  const {resolveLithologySymbol} = useContext(PlatformContext);
  if (size == null) { size = 30; }
  const patternSize = {width: size, height: size};
  const patternLoc = {x:0,y:0};

  return h('defs', patterns.map(function(d){
    const id = `pattern-${d[0]}`;
    return h('pattern', {
      id,
      key: id,
      patternUnits: "userSpaceOnUse",
      ...patternSize
    }, [
      h('rect', {
        fill: d[1],
        ...patternSize,
        ...patternLoc
      }),
      h('image', {
        xlinkHref: resolveLithologySymbol(d[0], {svg: true}),
        ...patternLoc,
        ...patternSize
      })
    ]);}));
};

class RegionalCrossSectionPage extends Component {
  constructor() {
    super(...arguments);
    this.state = {lines: null, points: null};
  }

  componentDidMount() {
    const v = removeLines(stratModel, 2);
    const el = select(findDOMNode(this));

    const tcs = el.select("div.temp-cross-section");
    tcs.html(v);
    const svg = tcs.select("svg");

    const main = svg.select("g#Main");

    /* Get path data */

    const lines = extractLines(main);

    const cs = el.select("svg.cross-section")
      .attr("viewBox", svg.attr("viewBox"));
    cs.select("g.linework")
      .node().appendChild(main.node());

    const pts = svg.select("g#Labels");
    cs.select("g.overlay")
      .node().appendChild(pts.node());

    /* Get facies data */
    const points = extractTextPositions(svg.select("g#Facies"));

    svg.remove();

    return this.setState({lines, points});
  }

  render() {
    const {lines, points} = this.state;
    return h('div', [
      h(SectionNavigationControl),
      h(SVG, {className: 'cross-section'}, [
        h(PolygonTopology, {
          lines,
          points,
          generateFill(p, i){
            const {facies_id, geometry} = p;
            if (!geometry) { return null; }
            if (facies_id != null) {
              return `url(#pattern-${facies_ix[facies_id][0]})`;
            }
            return schemeSet3[i%12];
          }
        }, [
          h(PatternDefs, {patterns: Object.values(facies_ix), size: 30})
        ]),
        h('g.linework'),
        h('g.overlay')
      ]),
      h('div.temp-cross-section')
    ]);
  }
}

export {RegionalCrossSectionPage};
