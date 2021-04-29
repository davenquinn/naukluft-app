import h, {compose} from '@macrostrat/hyper';
import {render} from 'react-dom';
import {PlatformProvider} from '~/platform';
import {SectionDataProvider} from '~/sections/data-providers';
import {RegionalSections} from '../main';
import {SectionSurfacesProvider} from '~/sections/providers'
import './main.styl'

import {Legend} from './legend'

const RegionalSectionsFigure = compose(
  PlatformProvider,
  SectionDataProvider,
  SectionSurfacesProvider,
  RegionalSections,
  Legend
)

export default (el, opts, cb) => render(h(RegionalSectionsFigure), el, cb);
