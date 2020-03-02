import h, {compose, C} from '@macrostrat/hyper';
import {render} from 'react-dom';
import {useContext} from 'react'

import {PlatformProvider} from '~/platform';
import {SectionDataProvider} from '~/sections/data-providers';
import {GeneralizedSections} from '../main'
import {SettingsProvider} from "../settings";
import {SectionSurfacesProvider} from '~/sections/providers';

import "./main.styl"
import "./fonts.css"

const StaticSectionSettings = C(SettingsProvider, {
  showFacies: true,
  showGrainsize: true,
  showLithology: true,
  showTriangleBars: true,
  showSequenceStratigraphy: true,
  showCarbonIsotopes: true,
  showOxygenIsotopes: true,
  isotopesPerSection: true,
  correlatedIsotopes: true,
  interactive: false
})

const Figure = compose(
  PlatformProvider,
  SectionDataProvider,
  SectionSurfacesProvider,
  StaticSectionSettings,
  'div.page.generalized-sections',
  GeneralizedSections
)


export default (el, opts, cb) => render(h(Figure), el, cb);
