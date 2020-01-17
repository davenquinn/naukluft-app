import {SectionGroup} from './section-group'
import {hyperStyled} from "@macrostrat/hyper"
import styles from "../main.styl"
import {nest} from "d3-collection"
import {group} from "d3-array"
import {SectionData} from './defs'
// This should be wrapped into a context
import {
  groupOrder,
  stackGroups,
  sectionOffsets,
  groupOffsets
} from "../display-parameters"

const h = hyperStyled(styles)

// This might be a bad type declaration
const orderLike = <T,U>(arr: T[], accessor: (U)=>T)=>{
  return (a: U, b: U): number =>{
    /*
    Function to sort an array like another array
    */
    let acc = accessor ?? function(d){ return d }
    return arr.indexOf(acc(a)) - arr.indexOf(acc(b))
  }
}

interface ArrangedSectionsProps {
  sections: SectionData[],
  groupMargin: number,
  location: string
}

function ArrangedSections(props: ArrangedSectionsProps){
  const {sections, tightenSpacing, groupMargin, location, ...rest} = props;
  const height = 1800;

  // Divide sections into groups by location
  let groups = Array.from(group(sections, d => d.location))
  // Group order should become a prop or context
  groups.sort(orderLike(groupOrder, d=>d[0]))

  return h('div.grouped-sections', groups.map((entry, i)=>{
    const [location, sections]: [string, SectionData[]] = entry
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
      sections,
      height,
      ...rest
    });
  }));
};

export * from './layout-group'
export {ArrangedSections, SectionGroup}
