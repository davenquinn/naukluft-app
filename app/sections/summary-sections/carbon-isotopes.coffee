import {withRouter} from "react-router-dom"
import {findDOMNode} from "react-dom"
import * as d3 from "d3"
import "d3-selection-multi"
import {Component, createElement} from "react"
import h from "@macrostrat/hyper"
import Measure from 'react-measure'
import {SectionAxis} from "#/axis"
import {query} from "../db"
import {sectionSurfaceProps} from "./link-overlay"
import {SVGNamespaces} from "../util"
import classNames from "classnames"
import chroma from "chroma-js"
import sql from '../sql/carbon-isotopes.sql'
import {
  ColumnSVG,
  CrossAxisLayoutProvider,
  ColumnLayoutContext
} from '#'
import T from 'prop-types'

fmt = d3.format('.1f')

class IsotopesColumnInner extends Component
  @contextType: ColumnLayoutContext
  @defaultProps: {
    visible: false
    label: 'δ¹³C'
    system: 'delta13c'
    trackVisibility: true
    offsetTop: null
    showLines: false
    surfaces: null
    xRatio: 6
    height: 100 # Section height in meters
    pixelsPerMeter: 2
    pixelOffset: 0 # This should be changed
    domain: [-15,6]
    colorScheme: d3.schemeCategory10
    padding:
      left: 10
      top: 10
      right: 10
      bottom: 30
  }

  constructor: (props)->
    super props
    {system} = @props
    @state = {
      colorScale: d3.scaleOrdinal(d3.schemeCategory10)
      isotopes: []
    }

    column = 'avg_'+system
    @line = d3.line()
      .x (d)=>@context.xScale(d[column])
      .y (d)=>@context.scale(d.height)

    query(sql).then(@setupData)

  setupData: (isotopes)=>
    isotopes = d3.nest()
      .key (d)->d.section
      .entries isotopes
      .sort (a,b)-> a.height < b.height
    @setState {isotopes}

  render: ->
    {id, zoom, padding,
     onResize,
     marginLeft, height,
     clip_end, pixelOffset
     heightOfTop
    } = @props
    innerHeight = height*@props.pixelsPerMeter

    {left, top, right, bottom} = padding

    scaleFactor = @props.scaleFactor/@props.pixelsPerMeter
    [mn,mx] = @props.domain
    innerWidth = (mx-mn)*@props.xRatio

    outerHeight = innerHeight+(top+bottom)
    outerWidth = innerWidth+(left+right)

    marginTop = heightOfTop*@props.pixelsPerMeter*@props.zoom

    [bottom,top] = @props.range

    txt = id

    {scale,visible, divisions} = @state
    zoom = @props.zoom

    size = {
      width: outerWidth
      height: outerHeight
    }

    {label} = @props

    transform = "translate(#{@props.padding.left} #{@props.padding.top})"

    minWidth = outerWidth
    h "div.isotopes-column", {
      style: {marginTop: 22}
    }, [
      h 'div.section-header.subtle', [
        h "h2", {style: {
          height: '1.2rem'
          position: 'absolute'
          top: '-1.4rem'
        }},label
      ]
      h 'div.section-outer', [
        h ColumnSVG, {
          width: outerWidth
        }, [
          @renderScale()
          @renderAxisLines()
          @renderData()
        ]
      ]
    ]

  locatePoint: (d, s=0)=>
    {system} = @props
    {xScale, scale} = @context
    v = d['avg_'+system]
    unless s == 0
      v += d['std_'+system]*s
    [xScale(v), scale(parseFloat(d.height))]

  renderAxisLines: =>
    getHeight = (d)->
      {height} = d.section_height.find (v)->v.section == 'J'
      return height

    {surfaces} = @props
    {scale} = @context
    return null unless surfaces?
    surfaces = surfaces.filter (d)->d.type == 'sequence-strat'
    h 'g.surfaces', {style: {strokeOpacity: 0.3}}, surfaces.map (d)=>
      try
        height = getHeight(d)
      catch
        # No height for section J. We should create a more
        # robust solution to this problem in the SQL code.
        return null

      y = scale(height)
      h 'line', {
        x1: -500
        x2: 500
        transform: "translate(0, #{y})"
        sectionSurfaceProps(d)...
      }

  renderData: =>
    {scale, xScale} = @context
    {isotopes} = @state
    cscale = d3.scaleOrdinal(@props.colorScheme)
    h 'g.data', isotopes.map ({key, values}, i)=>
      [x,y] = @locatePoint values[values.length-1]
      fill = stroke = cscale(i)
      lineValues = values.filter (d)->d.in_zebra_nappe
      h 'g.section-data', {key}, [
        h 'g.data-points', values.map (d)=>
          [x1,y1] = @locatePoint(d, -2)
          [x2,y2] = @locatePoint(d, 2)

          actualStroke = stroke
          if not d.in_zebra_nappe
            actualStroke = chroma(stroke).brighten(2).css()

          h 'line', {
            key: d.analysis_id
            x1,y1,
            x2,y2,
            stroke: actualStroke
            strokeWidth: 8
            strokeLinecap: 'round'
          }
        @renderValues(values, fill)
        h.if(@props.showLines) 'path', {
          d: @line(lineValues)
          stroke
          fill:'transparent'
        }
        h 'text', {
          transform: "translate(#{x},#{y})"
          x: 10,
          y: 5,
          fill
        }, key
      ]

  renderValues: (entries, stroke)=>
    {scale, xScale} = @context
    h 'g.data-points', entries.map (d)=>
      [x1,y1] = @locatePoint(d, -2)
      [x2,y2] = @locatePoint(d, 2)

      actualStroke = stroke
      if not d.in_zebra_nappe
        actualStroke = chroma(stroke).brighten(2).css()

      h 'line', {
        key: d.analysis_id
        x1,y1,x2,y2,
        stroke: actualStroke
        strokeWidth: 8
        strokeLinecap: 'round'
      }

  renderScale: =>
    {height} = @props
    {xScale, scale} = @context
    v = xScale.ticks()
    h 'g.scale', v.map (d)->
      x = xScale(d)
      y = scale(0)
      transform = "translate(#{x})"
      className = classNames {zero: d == 0}
      h 'g.tick', {transform, className, key: d}, [
        h 'line', {x0: 0, x1: 0, y0: 0, y1: y}
        h 'text', {y: y+12}, "#{d}"
      ]

IsotopesColumn = (props)->
  {width, domain, rest...} = props
  h CrossAxisLayoutProvider, {width, domain}, (
    h IsotopesColumnInner, rest
  )

IsotopesColumn.propTypes = {
  width: T.number.isRequired
  domain: T.arrayOf(T.number).isRequired
}

IsotopesColumn.defaultProps = {
  domain: [-15, 6]
  width: 150
}

export {IsotopesColumn}
