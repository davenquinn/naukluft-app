import {hyperStyled} from "@macrostrat/hyper";

import {BaseSectionPage} from '../components/base-page';
import {GeneralizedDataProvider} from './data-provider';
import {
  SummarySectionsSettings,
  defaultSettings
} from "../summary-sections/settings";
import {SectionPositionProvider} from "../components";
import {SectionPane} from './static-pane';
import {SectionSurfacesProvider} from '../summary-sections/data-provider';

import "../summary-sections/main.styl";
import styles from './main.styl';
const h = hyperStyled(styles);

const GeneralizedSectionsInner = props => h(BaseSectionPage, {
  id: 'generalized-sections',
  settingsPanel: SummarySectionsSettings,
  defaultSettings
}, [
  h(SectionPane)
]);

const GeneralizedSections = props => {
  return h(SectionSurfacesProvider, [
    h(GeneralizedDataProvider, [
      h(SectionPositionProvider, [
        h(GeneralizedSectionsInner)
      ])
    ])
  ]);
}

export {GeneralizedSections};
