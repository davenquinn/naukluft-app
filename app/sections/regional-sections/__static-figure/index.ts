import h, {compose} from '@macrostrat/hyper';
import {render} from 'react-dom';
import {PlatformProvider} from '~/platform';
import {SectionDataProvider} from '~/sections/data-providers';
import {RegionalSections} from '../main';
import {SectionSurfacesProvider} from '~/sections/summary-sections/data-provider';

const RegionalSectionsFigure = compose(
  PlatformProvider,
  SectionDataProvider,
  SectionSurfacesProvider,
  RegionalSections
)

export default (el, opts, cb) => render(h(RegionalSectionsFigure), el, cb);
