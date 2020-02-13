/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import h from '@macrostrat/hyper';
import {render} from 'react-dom';
import {RegionalSections} from '../main';
import {StaticFigureWrapper} from '~/__static-figure/wrapper';

/*
Endpoint for figure generation
*/
const RegionalSectionsFigure = props => h(StaticFigureWrapper, [
  h(RegionalSections)
]);

const wrapper = (el, opts, cb) => render(h(RegionalSectionsFigure), el, cb);

export default wrapper;
