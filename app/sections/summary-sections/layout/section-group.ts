import {hyperStyled} from "@macrostrat/hyper"
import {useSettings} from "@macrostrat/column-components"
import {SVGSectionComponent} from "../column"
import {LayoutGroup} from './layout-group'
import styles from "../main.styl"
import {sectionOffsets, stackGroups} from "../display-parameters"
import {SectionData, SectionPositions} from './defs'
import {useSectionPositions} from '../../components/link-overlay'
import {group} from 'd3-array'

const h = hyperStyled(styles)

function SectionColumn(props) {
  let {style} = props
  style.position = 'relative'
  style.width = style.width ?? 240
  return h('div.section-column', {style}, props.children)
}

interface SectionGroupProps {
  sections: SectionData[],
  columnMargin: number,
  columnWidth: number,
  height: number
}

const SectionGroup = (props: SectionGroupProps)=>{
  const {
    sections,
    columnMargin,
    columnWidth,
    height,
    ...rest
  } = props

  // Sort into columns within this group, using `stackGroups` variable
  let columns = group(sections, d => stackGroups.findIndex(v => v.includes(d.section)))
  columns = Array.from(columns)
  columns.sort((a,b)=> a[0]-b[0])
  columns = columns.map(a => a = a[1])

  // Get topmost column position
  const sectionIDs = sections.map(d => d.section)
  const pos: SectionPositions = useSectionPositions()
  const positions = Object.values(pos).filter(d => sectionIDs.includes(d))
  const top = Math.min(positions.map(d => d.y))
  const titleOffset = top-30

  const {showCarbonIsotopes, isotopesPerSection} = useSettings()

  return h(LayoutGroup, {titleOffset, ...rest}, columns.map((col, i)=>{
    let marginRight = columnMargin

    if (i == columns.length-1) marginRight = 0

    const style = {marginRight, height, width: columnWidth}

    return h(SectionColumn, {key: i, style}, col.map((row)=>{
      let {offset} = row
      const {start, clip_end: end, id} = row
      offset = sectionOffsets[id] ?? offset

      // Clip off the top of some columns...

      const height = end-start

      return h(SVGSectionComponent, {
        zoom: 0.1,
        key: id,
        triangleBarRightSide: id == 'J',
        showCarbonIsotopes,
        isotopesPerSection,
        offsetTop: 670-height-offset,
        range: [start, end],
        height,
        start,
        end,
        id
      })
    }))
  }))
}

export {LayoutGroup, SectionGroup, SectionColumn}
