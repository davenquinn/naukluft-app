import {SectionGroup} from './section-group'
import {hyperStyled} from "@macrostrat/hyper"
import styles from "../main.styl"
import {nest} from "d3-collection"
import {
  groupOrder,
  stackGroups,
  sectionOffsets,
  groupOffsets
} from "../display-parameters"

const h = hyperStyled(styles)

/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
function groupSectionData(sections, {stackGroups, groupOrder}){
  /*
  Create groups of sections
  */
  const stackGroup = d=> {
    for (let g of Array.from(stackGroups)) {
      if (g.indexOf(d.id) !== -1) {
        return g;
      }
    }
    return d.id;
  };

  const indexOf = arr => d => arr.indexOf(d);

  let __ix = indexOf(stackGroups);

  const sectionGroups = nest()
    .key(d => d.location)
    .key(stackGroup)
    .sortKeys((a, b) => __ix(a)-__ix(b))
    .entries(sections);

  // Change key names to be more semantic
  for (let g of Array.from(sectionGroups)) {
    g.columns = g.values.map(col => col.values);
    delete g.values;
    g.location = g.key;
    delete g.key;
  }

  __ix = indexOf(groupOrder);
  sectionGroups.sort((a, b) => __ix(a.location)-__ix(b.location));
  return sectionGroups;
};

function ArrangedSections(props){
  const {sections, tightenSpacing, groupMargin, location, ...rest} = props;
  const height = 1800;
  const groupedSections = groupSectionData(sections, {stackGroups, groupOrder});

  return h('div.grouped-sections', groupedSections.map(function({location, columns}, i){
    let marginRight = groupMargin;
    // Tighten spacing for Onis and Naukluft
    if (tightenSpacing) {
      if (location === 'Tsams') {
        marginRight = 0;
      }
      if (i === 0) {
        marginRight /= 2.5;
      }
      if (i === 1) {
        marginRight = 30;
      }
    }

    let style = {marginRight, height};

    if (location === 'Büllsport') {
      style = {position: 'absolute', top: 0, right: 0};
    }

    return h(SectionGroup, {
      key: location,
      location,
      style,
      columns,
      height,
      ...rest
    });
  }));
};

export * from './layout-group'
export {ArrangedSections, SectionGroup}
