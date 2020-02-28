import h, {compose} from '@macrostrat/hyper';
import {render} from 'react-dom';
import {useContext} from 'react'

import {PlatformProvider} from '~/platform';
import {SectionDataProvider, SectionDataContext} from '~/sections/data-providers';
import {SectionPane} from '../index'
import {SettingsProvider} from "@macrostrat/column-components";
import {SectionSurfacesProvider} from '../data-provider';

import "./main.styl"
import "./fonts.css"

const StaticFigureWrapper = compose(
  PlatformProvider,
  SectionDataProvider
)

const SummarySectionsStatic = function(props){
  const sectionSettings = {
    showFacies: true,
    showGrainsize: true,
    showLithology: true,
    showTriangleBars: true,
    showSequenceStratigraphy: true,
    showCarbonIsotopes: true,
    showOxygenIsotopes: true,
    isotopesPerSection: true
  };

  const sections = useContext(SectionDataContext);

  return h(SectionSurfacesProvider, [
    h(SettingsProvider, {
      ...sectionSettings

    }, [
      h('div.page.section-page', [
        h('div.panel-container', [
          h(SectionPane, {
            groupMargin: 400,
            columnMargin: 100,
            columnWidth: 150,
            sections,
            ...props,
          })
        ])
      ])
    ])
  ]);
};


const fn = props => h(StaticFigureWrapper, [
  h(SummarySectionsStatic)
]);

const wrapper = (el, opts, cb) => render(h(fn), el, cb);

export default wrapper;
