/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import {hyperStyled} from "@macrostrat/hyper";
import {useContext} from "react";
import {useSettings} from "@macrostrat/column-components";
import {ChemostratigraphyColumn} from "./chemostrat";
import {
  SectionLinkOverlay,
  SectionContainer,
  SectionPositionProvider
} from "../components";
import {
  SequenceStratConsumer,
  SequenceStratContext
} from "../sequence-strat-context";
import {LithostratKey} from "./lithostrat-key";
import {ArrangedSections} from "./layout";
import {Legend} from "./legend";
import {BaseSectionPage} from '../components';
import {EditorProvider} from './editor';
import {SummarySectionsSettings, defaultSettings} from './settings';
import {SectionSurfacesContext} from './data-provider';
import "../main.styl";
import styles from "./main.styl";
import T from 'prop-types';

const h = hyperStyled(styles);

const SectionPane = function(props) {
  let {sections,
   groupMargin,
   columnMargin,
   columnWidth,
   tightenSpacing
   } = props;

  const {surfaces} = useContext(SectionSurfacesContext);
  const {showLegend} = useSettings();
  const {showTriangleBars} = useContext(SequenceStratContext);

  if (sections == null) { return null; }
  if (!(sections.length > 0)) { return null; }

  const row = sections.find(d => d.id === 'J');
  let {offset, location, ...rest} = row;
  location = null;

  // Pre-compute section positions
  if (showTriangleBars) {
    columnWidth += 25;
  }

  const options = useSettings();
  const showChemostrat = options.correlatedIsotopes;

  return h('div#section-pane', {style: {overflow: 'scroll'}}, [
    h(SectionContainer, [
      h(SectionLinkOverlay, {
        connectLines: false,
        surfaces
      }),
      h(LithostratKey, {
        zoom: 0.1,
        key: "key",
        offset
      }),
      h.if(showChemostrat)(ChemostratigraphyColumn, {
        sections,
        showLines: false,
        options
      }),
      h("div#section-container", [
        h.if(showLegend)(Legend),
        h(ArrangedSections, {
          sections,
          groupMargin,
          columnMargin,
          columnWidth,
          tightenSpacing
        })
      ])
    ])
  ]);
};

SectionPane.defaultProps = {
  tightenSpacing: true
};

SectionPane.propTypes = {
  sections: T.arrayOf(T.object).isRequired,
  surfaces: T.arrayOf(T.object).isRequired,
  tightenSpacing: T.bool
};

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

const SummarySections = props => h(SectionPositionProvider, [
  h(EditorProvider, [
    h(SequenceStratConsumer, null, ({actions, ...rest}) => h(SummarySectionsBase, {
      ...props,
      ...rest
    }))
  ])
]);

export {
  SummarySections,
  SummarySectionsBase,
  SectionPane
};
