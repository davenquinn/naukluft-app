import h from '@macrostrat/hyper';
import {RegionalSections} from './main';
import {BaseSectionPage} from '../components';

const settingsPanel = 'div';

const RegionalSectionsPage = props => h(BaseSectionPage, {
  id: 'regional-sections',
  settingsPanel
}, [
  h(RegionalSections)
]);

export {RegionalSectionsPage};
