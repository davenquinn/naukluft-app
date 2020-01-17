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
  height: number,
  location: string
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
  const columnData: SectionData[][] = columns.map(a => a = a[1])

  // Get topmost column position
  const sectionIDs = sections.map(d => d.section)
  const pos: SectionPositions = useSectionPositions()
  const positions = Object.values(pos).filter(d => sectionIDs.includes(d.id))
  const top = Math.min(...positions.map(d => d.y))
  const titleOffset = top-90

  //let colWidth = positions[0]?.width ?? 150

  const {showCarbonIsotopes, isotopesPerSection} = useSettings()

  return h(LayoutGroup, {titleOffset, ...rest}, columnData.map((sections, i)=>{
    let marginRight = columnMargin

    if (i == columns.length-1) marginRight = 0

    const getWidth = (sections)=>{
      for (let s of sections) {
        let sPos = pos[s.section]
        if (sPos != null) {
          console.log(sPos)
          const w = sPos.width + sPos.paddingLeft + sPos.paddingRight
          if (w > 0) return w
        }
      }
      return 150
    }

    const width = getWidth(sections)
    //console.log(width)
    const style = {marginRight, height, width}

    return h(SectionColumn, {key: i, style}, sections.map((row)=>{
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
