/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import h from 'react-hyperscript';
import {join} from 'path';
import {select} from 'd3-selection';
import {Component} from 'react';
import {findDOMNode} from 'react-dom';
import {get} from 'axios';
import {SVG} from "@macrostrat/column-components";
import {
  PolygonTopology,
  extractLines,
  extractTextPositions,
  removeLines
} from '../components/polygon-topology';
import {useFaciesColors} from './util';
import {FillPatternDefs} from './pattern-fill'
// import S1 from './sequence-data-edited/S1.svg';
// import S2 from './sequence-data-edited/S2.svg';
// import S3 from './sequence-data-edited/S3.svg';
//
// const fileNames = {S1,S2,S3};

const getFile = async function(id){
  // console.log(id)
  // if (fn.startsWith("data:image/svg+xml;base64,")) {
  //   return atob(fn.split(',')[1]);
  // // // Webpack for S1, for some reason
  // // }
  try {
    const {readFileSync} = __non_webpack_require__('fs');
    const fn = join(__dirname, 'sequence-data-edited', id+".svg")
    const svg = readFileSync(fn, 'utf-8')
    return Promise.resolve(svg);
  } catch (error) {
    return get(fn, {responseType: 'text'});
  }
  // const fn = fileNames[id];
  // // encoded as a data URI (Electron-webpack)
  // if (fn.startsWith("data:image/svg+xml;base64,")) {
  //   return atob(fn.split(',')[1]);
  // // Webpack for S1, for some reason
  // } else if (fn.startsWith("imgs")) {
  //   const {data} = await get(fn, {responseType: 'text'});
  //   return data;
  // }
  //
  // try {
  //   const {readFileSync} = require('fs');
  //   const svg = readFileSync(fn, 'utf-8');
  //   return Promise.resolve(svg);
  // } catch (error) {
  //   return get(fn, {responseType: 'text'});
  // }
};

const getEditedSequenceOverlay = async function(id){
  let svg = await getFile(id);
  console.log(svg);
  const fst = removeLines(svg.toString(), 2);

  const el = document.createElement("div");
  el.innerHTML = fst;

  svg = el.querySelector("svg");
  const lyr2 = el.querySelector("#Layer_2");

  return select(svg);
};

const fillPatterns = {
  'shoreface-alluvial-siliciclastic': 607,
  'peritidal-siliciclastic': 670,
  'restricted-subtidal': 627,
  'p': 627,
  'marine-siliciclastic': null,
  'steepened-outer-ramp': 627,
  'marine-carbonate': 627,
  'shoal-shoreface': 627
  // 'lime_mudstone': 627,
  // 'sandstone': 607,
  // 'siltstone': 616,
  // 'dolomitic siltstone': 616,
  // 'shale': 620,
  // 'limestone': 627,
  // 'dolomite': 642,
  // 'conglomerate': 602,
  // 'dolomite-mudstone': 642,
  // 'mudstone': 620,
  // 'sandy-dolomite': 645,
  // 'quartzite': 702
}

const Topology = function(props){
  const colorIndex = useFaciesColors();
  const {id, ...rest} = props
  return h(PolygonTopology, {
    ...rest,
    generateFill(p,i){
      const {geometry, facies_id} = p;
      if (!geometry) return null
      if (facies_id != null) {
        const pattern = fillPatterns[facies_id];
        if (pattern != null) {
          return `url(#${id}-${pattern})`
        }
        return colorIndex[facies_id];
      }
      return '#eeeeee';
    }
  });
};

const extractTopology = async (el, id) => {
  const svg = await getEditedSequenceOverlay(id);
  console.log(svg);
  if (svg == null) { return; }

  const main = svg.select("g#Lines");
  /* Get path data */
  const lines = extractLines(main);

  for (let v of ['viewBox', 'width', 'height']) {
    el.attr(v, svg.attr(v));
  }

  el.select("g.linework")
    .node().appendChild(main.node());

  const pts = svg.select("g#Labels").node();
  if (pts != null) {
    el.select("g.overlay")
      .node().appendChild(pts);
  }

  /* Get facies data */
  const points = extractTextPositions(svg.select("g#Facies"));

  svg.remove();

  return {lines, points}
}

class CrossSectionUnits extends Component {
  constructor() {
    super(...arguments);
    this.state = {lines: null, points: null};
  }

  componentDidMount() {
    return this.extractTopology();
  }

  async extractTopology() {
    const {id} = this.props;
    const el = select(findDOMNode(this));
    const {lines, points} = await extractTopology(el, id)
    return this.setState({lines, points});
  };

  render() {
    const {id, ...rest} = this.props;
    const {lines, points} = this.state;
    return h(SVG, {className: 'cross-section', ...rest}, [
      h(FillPatternDefs, {prefix: id, patterns: Object.values(fillPatterns)}),
      h(Topology, {
        id,
        lines,
        points
      }),
      h('g.linework'),
      h('g.overlay')
    ]);
  }
}

export {CrossSectionUnits};
