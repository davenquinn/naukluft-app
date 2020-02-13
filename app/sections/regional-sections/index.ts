/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import h from '@macrostrat/hyper';
import {RegionalSections} from './main';
import {BaseSectionPage} from '../components';

const settingsPanel = 'div';
const defaultSettings = {};

const RegionalSectionsPage = props => h(BaseSectionPage, {
  id: 'regional-sections',
  settingsPanel,
  defaultSettings
}, [
  h(RegionalSections)
]);

export {RegionalSectionsPage};
