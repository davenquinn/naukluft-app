/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import h from "@macrostrat/hyper"
import {Component, createRef} from "react"
import {query} from "../../db"
import {scaleLinear} from 'd3-scale'
import {SVGNamespaces, KnownSizeComponent} from "../util"
import sql from './sql/lithostratigrapy-names.sql'

const LSLabel = (props)=>{
  const {y, name, width, extend} = this.props
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

class LithostratigraphyColumn extends Component {
  constructor(props){
    super(props)
    this.state = {names: []}
    query('lithostratigraphy-names', null, {baseDir: __dirname})
      .then(names=> {
        return this.setState({names})
    })
  }

  render() {
    let transform
    let {surfaces, scale} = this.props
    const {names} = this.state

    surfaces = surfaces
      .filter(d => d.type === 'lithostrat')
      .map(function(d){
        const {section_height, ...rest} = d
        const {height} = section_height.find(v => v.section === 'J')
        return {height, ...rest}})

    surfaces.sort((a, b) => a.height - b.height)

    const __formations = []
    const __members = []
    for (var d of Array.from(surfaces)) {
      const y = scale(d.height)
      transform = `translate(0,${y}) rotate(-90)`
      const surfaceData = names.find(v => v.id === d.upper_unit)
      if (surfaceData == null) { continue }
      if (surfaceData.level === 3) {
        __formations.push(h(LSLabel, {y, name: surfaceData.short_name, extend: true}))
        continue
      }
      if (d.commonality === 2) {
        __formations.push(h(LSLabel, {y, name: surfaceData.formation_short_name}))
      }

      __members.push(h(LSLabel, {y, name: surfaceData.short_name}))
    }

    return h('g.lithostratigraphy', [
      h('g.formations', {style: {fontSize: 20}}, __formations),
      h('g.members', {transform: "translate(20)",style: {fontSize: 14, fontStyle: 'italic'}}, __members)
    ])
  }
}

class BaseSVGSectionComponent extends KnownSizeComponent {
  constructor(props){
    super(props)
  }

  render() {
    let {id, zoom, padding, lithologyWidth,
     innerWidth, onResize, marginLeft,
     showFacies, height, clip_end, surfaces} = this.props

    const innerHeight = height*this.props.pixelsPerMeter*this.props.zoom

    let {left, top, right, bottom} = padding

    const scaleFactor = this.props.scaleFactor/this.props.pixelsPerMeter

    this.state.scale.range([innerHeight, 0])
    const outerHeight = innerHeight+(top+bottom)
    const outerWidth = innerWidth+(left+right)

    const {heightOfTop} = this.props
    //const marginTop = heightOfTop*this.props.pixelsPerMeter*this.props.zoom

    [bottom,top] = this.props.range

    const {scale, divisions} = this.state

    ({
      zoom
    } = this.props)

    // Set up number of ticks

    const style = {
      width: outerWidth,
      height: outerHeight,
      marginTop: 12,
      marginLeft
    }

    const transform = `translate(${left} ${this.props.padding.top})`

    const minWidth = outerWidth
    return h("div.section-container", {
      style: {minWidth}
    }, [
      h('div.section-outer', [
        h("svg.section", {style, ...SVGNamespaces}, [
          h('g.backdrop', {transform}, [
            h(LithostratigraphyColumn, {scale, divisions, surfaces})
          ])
        ])
      ])
    ])
  }
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
