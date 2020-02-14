/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import {hyperStyled} from "@macrostrat/hyper";
import {useContext} from 'react';

import {
  SectionPositionProvider,
  SectionLinkOverlay
} from "../components/link-overlay";
import {SectionSurfacesContext} from '../summary-sections/data-provider';
import {getGeneralizedHeight, exportSVG} from './helpers';
import {FaciesSection} from './column';
import {exportSequence} from './svg-export';
import {CrossSectionUnits} from './section-units';
import {PlatformContext, Platform} from '~/platform';

import styles from './main.styl';
const h = hyperStyled(styles);

const LinkOverlay = function(props){
  const {sections, topSurface, bottomSurface, ...rest} = props;
  let {surfaces} = useContext(SectionSurfacesContext);
  const generalize = getGeneralizedHeight(sections, {topSurface, bottomSurface});

  surfaces = surfaces.map(function({section_height, ...rest1}){
    // Update surfaces to use generalized section heights
    section_height = section_height.map(generalize).filter(d => d != null);
    return {section_height, ...rest1};});

  return h(SectionLinkOverlay, {
    className: 'sequence-link-overlay',
    surfaces,
    connectLines: true,
    ...rest
  });
};

const CorrelationContainer = function(props){
  const {id, sections, children, paddingBottom, ...rest} = props;
  const domID = `sequence-${id}`;

  const ctx = useContext(PlatformContext);

  let outerRef = function(node){
    if (node == null) { return; }
    const observer = new MutationObserver(exportSequence(id, node));
    return observer.observe(node, {childList: true});
  };

  if (ctx.platform !== Platform.ELECTRON) {
    outerRef = null;
  }

  const hideLinks = true;
  let style = null;
  if (hideLinks) {
    style = {opacity: 0.2};
  }

  return h(SectionPositionProvider, [
    h('div.sequence', {id: domID, ref: outerRef}, [
      h('div.generalized-sections', {style: {paddingBottom}}, children),
      h(CrossSectionUnits, {id}),
      h(LinkOverlay, {sections, style, paddingBottom, ...rest})
    ])
  ]);
};


const SequenceCorrelations = function(props){
  const {sections, offsets, id, bottomSurface,
   topSurface, paddingBottom, ...rest} = props;

  return h(CorrelationContainer, {
    id,
    sections,
    topSurface,
    bottomSurface,
    paddingBottom,
    width: 1200
  }, sections.map(function({key,divisions}){
    let start = 0;
    // Bottom is the first division with an assigned facies
    for (let d of Array.from(divisions)) {
      if ((d.facies != null) && (d.facies !== 'none')) {
        start = d.bottom;
        break;
      }
    }
    // Top of the last section is taken as the height
    // at which to clip off errant facies
    const end = divisions[divisions.length-1].top;

    return h(FaciesSection, {
      id: key,
      zoom: 0.05,
      key,
      offsetTop: offsets[key] || 0,
      range: [start, end],
      divisions,
      bottomSurface,
      topSurface,
      ...rest
    });}));
};

export {SequenceCorrelations};
