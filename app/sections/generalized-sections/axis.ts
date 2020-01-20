import {hyperStyled} from '@macrostrat/hyper'
import {
  ColumnContext,
  ColumnAxis,
  expandDivisionsByKey
} from '@macrostrat/column-components'
import {useContext, useRef, useState, useLayoutEffect} from 'react'
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
   ticks: (height*zoom),
   tickSize: 2,
   showLabel(d){ return false }
 })
}

interface SectionBreakProps {
  division: GeneralizedDivision
  textPadding?: number
}

const SectionBreak = (props: SectionBreakProps)=>{
  const {scaleClamped} = useContext(ColumnContext)
  const {division: d} = props
  const btm = scaleClamped(d.bottom)
  const top = scaleClamped(d.top)
  const height = btm-top
  const heightM = d.top-d.bottom
  const textPadding = props.textPadding ?? 10

  const ref = useRef<HTMLElement>()
    const [rect, setRect] = useState<DOMRect>(null)

  useLayoutEffect(()=>{
    if (ref.current == null) return
    const rect = ref.current.getBoundingClientRect()
    setRect(rect)
  }, [ref])

  const textHeight = rect?.height ?? 0
  console.log(rect?.height, height)
  const showPrefix = (textHeight < height-2*textPadding)


  return h("div.section-break", {
    style: {height},
    className: `section-${d.original_section}`
  }, [
    h('span', {ref}, [
      h('span.section-break-title', [
        h.if(showPrefix)('span.prefix', "Section "),
        h('span.section-id', `${d.original_section}`)
      ]),
      h('span.height', `${Math.round(heightM)} m`)
    ])
  ])
}

const GeneralizedBreaks = (props)=>{
  const {divisions} = useContext(ColumnContext)

  let breaks: GeneralizedDivision[] = expandDivisionsByKey(divisions, 'original_section')
  breaks.reverse()

  return h('div.generalized-breaks',
    breaks.map(division=>h(SectionBreak, {division}))
  )
}

export {GeneralizedAxis, GeneralizedBreaks}
