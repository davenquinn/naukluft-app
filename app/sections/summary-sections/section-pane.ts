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
import {SectionLinkOverlay, SectionContainer} from "../components";
import {LithostratKey} from "./lithostrat-key";
import {ArrangedSections} from "./layout";
import {Legend} from "./legend";
import {SectionSurfacesContext} from './data-provider';
import {SectionData} from './layout/defs'
import styles from './main.styl'
import "../main.styl";

const h = hyperStyled(styles);

interface SectionPaneProps {
  scrollable: boolean,
  groupMargin: number,
  columnMargin: number,
  columnWidth: number,
  sections: SectionData[],
  tightenSpacing: boolean
}

const SectionPane = function(props: SectionPaneProps) {
  let {sections,
   groupMargin,
   columnMargin,
   columnWidth,
   tightenSpacing,
   scrollable
   } = props;

  const {surfaces} = useContext(SectionSurfacesContext);
  const {showLegend} = useSettings();

  if (sections == null) { return null; }
  if (!(sections.length > 0)) { return null; }

  const row = sections.find(d => d.id === 'J');
  let {offset} = row;

  const options = useSettings();
  const showChemostrat = options.correlatedIsotopes;
  const overflow = scrollable ? 'scroll' : 'inherit'

  return h('div#section-pane', {style: {overflow}}, [
    h.if(showLegend)(Legend),
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
  tightenSpacing: true,
  scrollable: true
};

export {SectionPane};
