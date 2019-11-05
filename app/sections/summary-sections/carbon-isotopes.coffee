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
import allCarbonIsotopes from '../sql/all-carbon-isotopes.sql'

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
    domain: [-15,8]
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
    {padding, label} = @props
    {width: innerWidth} = @context
    {left, top, right, bottom} = padding

    h "div.isotopes-column", {
      style: {marginTop: 6}
    }, [
      h 'div.section-header.subtle', [
        h "h2",label
      ]
      h 'div.section-outer', [
        h ColumnSVG, {
          innerWidth
          paddingLeft: padding.left
          paddingRight: padding.right
          paddingBottom: padding.bottom
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

class MinimalIsotopesColumnInner extends Component
  @contextType: ColumnLayoutContext
  @defaultProps: {
    visible: false
    label: 'δ¹³C'
    system: 'delta13c'
    offsetTop: null
    domain: [-15,8]
    colorScheme: d3.schemeCategory10
    padding:
      left: 10
      top: 10
      right: 10
      bottom: 30
  }

  @propTypes: {
    section: T.string.isRequired
  }

  constructor: (props)->
    super props
    {system} = @props
    @state = {
      isotopes: []
    }

    column = 'avg_'+system
    @line = d3.line()
      .x (d)=>@context.xScale(d[column])
      .y (d)=>@context.scale(d.height)

    query(allCarbonIsotopes).then(@setupData)

  setupData: (data)=>
    isotopes = data
      .filter (d)=> d.section == @props.section
      .sort (a,b)-> a.orig_height < b.orig_height
    console.log isotopes
    @setState {isotopes}

  render: ->
    {padding, label, transform} = @props
    {width: innerWidth} = @context
    {left, top, right, bottom} = padding

    h 'g.isotopes-column', {transform}, [
      @renderScale()
      @renderData()
    ]

  locatePoint: (d, s=0)=>
    {system} = @props
    {xScale, scale} = @context
    v = d['avg_'+system]
    unless s == 0
      v += d['std_'+system]*s
    [xScale(v), scale(parseFloat(d.height))]

  renderData: =>
    {scale, xScale} = @context
    {isotopes} = @state
    cscale = d3.scaleOrdinal(@props.colorScheme)
    stroke = '#888'

    h 'g.data', [
      h 'g.data-points', isotopes.map (d)=>
        [x1,y1] = @locatePoint(d, -2)
        [x2,y2] = @locatePoint(d, 2)

        h 'line', {
          key: d.analysis_id
          x1,y1,
          x2,y2,
          stroke
          strokeWidth: 6
          strokeLinecap: 'round'
        }
      h.if(@props.showLines) 'path', {
        d: @line(isotopes)
        stroke
        fill:'transparent'
      }
    ]

  renderScale: =>
    {height} = @props
    {xScale, scale, pixelHeight} = @context
    v = [0]
    h 'g.scale', v.map (d)->
      x = xScale(d)
      y = scale(0)
      transform = "translate(#{x})"
      className = classNames {zero: d == 0}
      h 'g.tick', {transform, className, key: d}, [
        h 'line', {x0: 0, x1: 0, y0: 0, y1: pixelHeight, stroke: '#aaa'}
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

MinimalIsotopesColumn = (props)->
  {width, domain, rest...} = props
  h CrossAxisLayoutProvider, {width, domain}, (
    h MinimalIsotopesColumnInner, rest
  )

MinimalIsotopesColumn.defaultProps = IsotopesColumn.defaultProps

export {IsotopesColumn, MinimalIsotopesColumn}
