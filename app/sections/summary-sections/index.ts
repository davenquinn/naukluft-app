import {hyperStyled, compose} from "@macrostrat/hyper";
import {SectionPositionProvider} from "../components";
import {SectionPane} from './section-pane'
import {BaseSectionPage} from '../components';
import {EditorProvider} from './editor';
import {SummarySectionsSettings, defaultSettings} from './settings';
import "../main.styl";
import styles from "./main.styl";

const h = hyperStyled(styles);

const SummarySectionsBase = (props)=>{
  const {settingsPanel, ...rest} = props;
  return h(BaseSectionPage, {
    id: 'summary-sections',
    settingsPanel,
    defaultSettings
  }, [
    h(SectionPane, rest)
  ]);
}

SummarySectionsBase.defaultProps = {
  groupMargin: 400,
  columnMargin: 100,
  columnWidth: 150,
  showNavigationController: true,
  settingsPanel: SummarySectionsSettings
};

const SummarySections = compose(
  SectionPositionProvider,
  EditorProvider,
  SummarySectionsBase
)

export {
  SummarySections,
  SummarySectionsBase,
  SectionPane
};
