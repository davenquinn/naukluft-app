/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import {hyperStyled} from "@macrostrat/hyper";
import {group} from 'd3-array';

import {BaseSectionPage} from '../components/base-page';
import {
  ColumnDivisionsContext,
  GeneralizedDivisionsProvider
} from './data-provider';
import {GeneralizedSectionSettings, defaultSettings} from "./settings";
import "../summary-sections/main.styl";
import {
  useSettings,
  ColumnProvider
} from '@macrostrat/column-components';
import {useContext} from 'react';
import {
  SectionPositionProvider,
  SectionLinkOverlay
} from "../components/link-overlay";
import {
  SectionSurfacesProvider,
  SectionSurfacesContext
} from '../summary-sections/data-provider';
import {SVGSectionInner} from '../summary-sections/column';
import {GeneralizedAxis, GeneralizedBreaks} from './axis';
import styles from './main.styl';
const h = hyperStyled(styles);

const GeneralizedSection = function(props){
  const {range, height, divisions, zoom, offsetTop, ...rest} = props;
  const {id} = rest;
  return h('div.section-column', {className: id}, [
    h(ColumnProvider, {
      range,
      height,
      divisions,
      zoom
    }, [
      h(SVGSectionInner, {
        ...rest,
        offsetTop,
        absolutePosition: false,
        axisComponent: GeneralizedAxis
      }, [
        h(GeneralizedBreaks)
      ])
    ])
  ]);
};

function compactMap<A,B>(arr: A[], mapper: (arg0: A)=>B): B[] {
  return arr.map(mapper).filter(d => d != null)
}

const match = (d, v): boolean => {
  return d.original_section == v.section && d.original_bottom == v.height
}

const LinkOverlay = function(props){
  const {divisions} = useContext(ColumnDivisionsContext)
  const {surfaces} = useContext(SectionSurfacesContext);

  const newSurfaces = surfaces.map(surface => {
    const section_height = compactMap(surface.section_height, v =>{
      const div = divisions.find(d => match(d,v))
      if (div == null) return null
      return {...v, height: div.bottom, section: div.section_id}
    })
    return {...surface, section_height}
  })

  return h(SectionLinkOverlay, {surfaces: newSurfaces});
};

// Should allow switching between offset types
const stratOffsets = {
  Onis: 0,
  Ubisis: 300,
  Tsams: 200
};

const compactOffsets = {
    Onis: 0,
    Ubisis: 270,
    Tsams: 0
  };


const SectionPane = function(props){
  const {divisions} = useContext(ColumnDivisionsContext);
  const surfaceMap = group(divisions, s => s.section_id);
  const sections = Array.from(surfaceMap, function([key,surfaces]){
    surfaces.sort((a, b) => a.bottom-b.bottom);
    return {key,surfaces};
  });

  const order = ['Onis', 'Ubisis', 'Tsams'];
  sections.sort((a, b) => order.indexOf(a.key)-order.indexOf(b.key));

  const offsets = stratOffsets;

  return h('div#section-pane', {style: {overflow: 'scroll'}}, [
    h("div#section-page-inner", [
      h(LinkOverlay, {sections}),
      h('div.generalized-sections', sections.map(function({key,surfaces}){
        let start = 0;
        // Bottom is the first division with an assigned facies
        for (let d of Array.from(surfaces)) {
          if ((d.facies != null) && (d.facies !== 'none')) {
            start = d.bottom;
            break;
          }
        }
        // Top of the last section is taken as the height
        // at which to clip off errant facies
        const end = parseFloat(surfaces[surfaces.length-1].top);

        return h(GeneralizedSection, {
          id: key,
          zoom: 0.1,
          key,
          triangleBarRightSide: key === 'Onis',
          offsetTop: offsets[key],
          start,
          end,
          range: [start, end],
          height: end-start,
          divisions: surfaces
        });}))
    ])
  ]);
};


const GeneralizedSectionsInner = props => h(BaseSectionPage, {
  id: 'generalized-sections',
  settingsPanel: GeneralizedSectionSettings,
  defaultSettings
}, [
  h(SectionPane)
]);

const GeneralizedSections = props => h(SectionSurfacesProvider, [
  h(GeneralizedDivisionsProvider, [
    h(SectionPositionProvider, [
      h(GeneralizedSectionsInner)
    ])
  ])
]);

export {GeneralizedSections};
