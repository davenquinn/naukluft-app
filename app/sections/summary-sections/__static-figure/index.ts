/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import h from 'react-hyperscript';
import {render} from 'react-dom';
import {SummarySectionsStatic} from '../index';
import {SectionConsumer} from '~/sections/data-providers';
import {StaticFigureWrapper} from '~/__static-figure/wrapper';

const fn = props => h(StaticFigureWrapper, [
  h(SummarySectionsStatic, {sections})
]);


const wrapper = (el, opts, cb) => render(h(fn), el, cb);

export default wrapper;
