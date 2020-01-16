import {hyperStyled} from "@macrostrat/hyper"
import {useSettings} from "@macrostrat/column-components"
import {SVGSectionComponent} from "../column"
import {LayoutGroup} from './layout-group'
import styles from "../main.styl"
import {sectionOffsets} from "../display-parameters"

const h = hyperStyled(styles)

function SectionColumn(props) {
  let {style} = props
  style.position = 'relative'
  style.width = style.width ?? 240
  return h('div.section-column', {style}, props.children)
}

const SectionGroup = props =>{
  const {columns, columnMargin, columnWidth, height, ...rest} = props

  const {showCarbonIsotopes, isotopesPerSection} = useSettings()

  return h(LayoutGroup, rest, columns.map((col, i)=>{
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
