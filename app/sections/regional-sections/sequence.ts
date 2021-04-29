import {hyperStyled} from "@macrostrat/hyper";
import {useContext} from 'react';

import {
  SectionPositionProvider,
  SectionLinkOverlay
} from "../components/link-overlay";
import {useSurfaces} from '~/sections/providers';
import {FaciesSection} from './column';
import {exportSequence} from './svg-export';
import {CrossSectionUnits} from './section-units';
import {PlatformContext, Platform} from '~/platform';

import styles from './main.styl';
const h = hyperStyled(styles);

const LinkOverlay = function(props){
  const {sections, topSurface, bottomSurface, ...rest} = props;
  let surfaces = useSurfaces();

  return h(SectionLinkOverlay, {
    className: 'sequence-link-overlay',
    surfaces,
    connectLines: true,
    ...rest
  });
};

const CorrelationContainer = function(props){
  const {
    id, sections, children, paddingBottom,
    exportCorrelations, ...rest} = props;
  const domID = `sequence-${id}`;

  const ctx = useContext(PlatformContext);

  let outerRef = function(node){
    if (node == null || !exportCorrelations) { return; }
    const exporter = exportSequence(id, node)
    const observer = new MutationObserver(exporter);
    observer.observe(node, {childList: true});
    exporter()
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
      //h(LinkOverlay, {sections, style, paddingBottom, ...rest})
    ])
  ]);
};


const SequenceCorrelations = function(props){
  const {
    sections, offsets, id, bottomSurface,
    topSurface, paddingBottom,
    exportCorrelations, ...rest} = props;

  return h(CorrelationContainer, {
    id,
    sections,
    topSurface,
    bottomSurface,
    paddingBottom,
    // Only set to true when you want to export (hack. could make a button in settings.)
    exportCorrelations: false,
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
