import h, {compose} from '@macrostrat/hyper';
import {render} from 'react-dom';
import {SummarySectionsStatic} from '../index';

import {PlatformProvider} from '~/platform';
import {SectionDataProvider} from '~/sections/data-providers';
import "./main.styl"
import "./fonts.css"

const StaticFigureWrapper = compose(
  PlatformProvider,
  SectionDataProvider
)

const fn = props => h(StaticFigureWrapper, [
  h(SummarySectionsStatic)
]);

const wrapper = (el, opts, cb) => render(h(fn), el, cb);

export default wrapper;
