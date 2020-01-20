import {hyperStyled} from '@macrostrat/hyper'
import {
  ColumnContext,
  ColumnAxis,
  expandDivisionsByKey
} from '@macrostrat/column-components'
import {useContext} from 'react'
import styles from './main.styl'
import {format} from 'd3-format'

const fmt = format('i')

const h = hyperStyled(styles)

interface GeneralizedDivision {
  id: number,
  section: string,
  original_section: string,
  original_bottom: number,
  original_top: number,
  bottom: number,
  top: number,
  facies_color: string,
  surface: number,
  section_end: number
}

const GeneralizedAxis = function(props){
 const {height, zoom, scale, pixelsPerMeter} = useContext(ColumnContext)
 const ratio = pixelsPerMeter*zoom

 // Keep labels from inhabiting the top few pixels (to make space for section labels)
 const topPadding = 30
 const maxVal = scale.domain()[1]-(topPadding/ratio)

 return h(ColumnAxis, {
   ticks: (height*zoom)/2,
   tickSize: 4,
   showLabel(d){ return false }
 })
}

const GeneralizedBreaks = (props)=>{
  const {scaleClamped, divisions} = useContext(ColumnContext)

  let breaks: GeneralizedDivision[] = expandDivisionsByKey(divisions, 'original_section')
  breaks.reverse()

  return h('div.generalized-breaks', breaks.map((d,i)=>{
    const btm = scaleClamped(d.bottom)
    const top = scaleClamped(d.top)
    const height = btm-top
    const heightM = d.top-d.bottom

    return h("div.section-break", {
      style: {height},
      className: `section-${d.original_section}`
    }, [
      h('span.section-break-title', [
        h('span.prefix', "Section "),
        h('span.section-id', `${d.original_section}`)
      ]),
      h('span', `${Math.round(heightM)} m`)
    ])
  }))
}

export {GeneralizedAxis, GeneralizedBreaks}
