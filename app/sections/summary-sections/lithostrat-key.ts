/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import h from "@macrostrat/hyper"
import {Component, createRef, useContext} from "react"
import {useQuery} from "~/db"
import {ColumnSVG} from '@macrostrat/column-components'
import {
  SectionSurfacesContext,
  ColumnProvider,
  ColumnContext
} from './data-provider'
import sql from './sql/lithostratigraphy-names.sql'

const LSLabel = (props)=>{
  const {y, name, width, extend} = props
  const x2 = extend ? width : 0
  return h('g.label', {transform: `translate(${width},${y})`}, [
    h('line', {
      x1: -width,
      x2, y1: 0,
      y2: 0,
      stroke: '#888',
      strokeWidth: 2
    }),
    h('text', {
      transform: "rotate(-90) translate(5,-4)"
    }, name)
  ])
}

LSLabel.defaultProps = { width: 20, extend: false}

const LithostratigraphyColumn = (props)=>{
  const names = useQuery(sql)
  let {surfaces} = useContext(SectionSurfacesContext)
  const {scale} = useContext(ColumnContext)

  if (names == null) {
    return null
  }

  surfaces = surfaces
    .filter(d => d.type === 'lithostrat')
    .map(function(d){
      const {section_height, ...rest} = d
      const {height} = section_height.find(v => v.section === 'J')
      return {height, ...rest}})

  surfaces.sort((a, b) => a.height - b.height)

  const formations = []
  const members = []

  let transform
  for (var d of Array.from(surfaces)) {
    const y = scale(d.height)
    transform = `translate(0,${y}) rotate(-90)`
    const surfaceData = names.find(v => v.id === d.upper_unit)
    if (surfaceData == null) { continue }
    if (surfaceData.level === 3) {
      formations.push(h(LSLabel, {y, name: surfaceData.short_name, extend: true}))
      continue
    }
    if (d.commonality === 2) {
      formations.push(h(LSLabel, {y, name: surfaceData.formation_short_name}))
    }

    members.push(h(LSLabel, {y, name: surfaceData.short_name}))
  }

  return h('g.lithostratigraphy', [
    h('g.formations', {style: {fontSize: 20}}, formations),
    h('g.members', {transform: "translate(20)", style: {fontSize: 14, fontStyle: 'italic'}}, members)
  ])
}

const BaseSVGSectionComponent = (props)=>{
  let {padding, innerWidth} = props
  let {left, right} = padding

  const outerWidth = innerWidth+(left+right)


  // Set up number of ticks

  const transform = `translate(${left} ${props.padding.top})`

  const minWidth = outerWidth
  return h("div.section-container.lithostratigraphy-names", {
    style: {minWidth}
  }, [
    h('div.section-outer', [
      h(ColumnProvider, {id: 'J'}, [
        h(ColumnSVG, {width: 50}, [
          h('g.backdrop', {transform}, [
            h(LithostratigraphyColumn)
          ])
        ])
      ])
    ])
  ])
}

BaseSVGSectionComponent.defaultProps = {
  zoom: 1,
  pixelsPerMeter: 20,
  skeletal: false,
  offset: 0,
  offsetTop: null,
  useRelativePositioning: true,
  showTriangleBars: false,
  trackVisibility: false,
  innerWidth: 40,
  height: 100, // Section height in meters
  lithologyWidth: 40,
  showFacies: true,
  showFloodingSurfaces: true,
  onResize() {},
  marginLeft: 0,
  padding: {
    left: 5,
    top: 10,
    right: 5,
    bottom: 10
  }
}

class LithostratKey extends Component {
  render() {
    return h('div.align-with-sections', {style: {marginLeft: 20}}, [
      h(BaseSVGSectionComponent, this.props)
    ])
  }
}

export {LithostratKey}
