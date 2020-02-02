import {withRouter} from "react-router-dom"
import {findDOMNode} from "react-dom"
import * as d3 from "d3"
import {scaleLinear} from 'd3-scale'
import {line} from 'd3-shape'
import "d3-selection-multi"
import {Component, createElement, createContext, useContext} from "react"
import h from "@macrostrat/hyper"
import Measure from 'react-measure'
import {SectionAxis} from "@macrostrat/column-components/dist/esm/axis"
import classNames from "classnames"
import chroma from "chroma-js"
import {AxisBottom} from '@vx/axis'

import {sectionIsotopeScheme} from '../display-parameters'
import {useIsotopes} from './data-manager'
import {sectionSurfaceProps} from '../../components/link-overlay'
import {query} from "../../db"
import sql from '../../sql/carbon-isotopes.sql'
import allCarbonIsotopes from '../../sql/all-carbon-isotopes.sql'
import {
  IsotopesDataArea, useDataLocator,
  IsotopeDataLine, IsotopeDataPoint
} from './data-area'

import {
  ColumnSVG,
  CrossAxisLayoutProvider,
  ColumnLayoutContext
  useSettings
} from '@macrostrat/column-components'
import T from 'prop-types'

fmt = d3.format('.1f')

IsotopeText = ({datum, text, rest...})->
  {pointLocator} = useDataLocator()
  [x,y] = pointLocator(datum)
  h 'text', {
    x, y, rest...
  }, text

IsotopeText.propTypes = {
  datum: T.object.isRequired
}

ScaleLine = (props)->
  {value, className, labelBottom, labelOffset, rest...} = props
  labelBottom ?= false
  labelOffset ?= 12
  {xScale, scale, pixelHeight} = useContext(ColumnLayoutContext)
  x = xScale(value)
  transform = "translate(#{x})"
  className = classNames(className, {zero: value == 0})
  h 'g.tick', {transform, className, key: value}, [
    h 'line', {x0: 0, x1: 0, y0: 0, y1: pixelHeight, rest...}
    h.if(labelBottom) 'text', {y: pixelHeight+labelOffset}, "#{value}"
  ]

ScaleLine.propTypes = {
  value: T.number.isRequired
  labelBottom: T.bool
}

class IsotopesColumnInner extends Component
  @contextType: ColumnLayoutContext
  @defaultProps: {
    visible: false
    corrected: false
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
    colorScheme: sectionIsotopeScheme
    padding:
      left: 10
      top: 10
      right: 10
      bottom: 30
  }
  @propTypes: {
    isotopes: T.object.isRequired
  }
  render: ->
    {padding, label} = @props
    {width: innerWidth} = @context
    {left, top, right, bottom} = padding

    h "div.isotopes-column", [
      h 'div.section-header.subtle', [
        h "h2",label
      ]
      h 'div.section-outer', [
        h ColumnSVG, {
          innerWidth
          paddingTop: padding.top
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
    {system, corrected, isotopes} = @props
    return null unless isotopes?

    allIsotopes = Array.from(isotopes).filter ([k,v])->not ['K','W1','L'].includes(k)
    h IsotopesDataArea, {system, corrected}, allIsotopes.map ([key, values], i)=>
      topDatum = values[values.length-1]
      #[x,y] = @locatePoint values[values.length-1]
      fill = stroke = @props.colorScheme(key, i)

      h 'g.section-data', {key}, [
        h 'g.data-points', values.map (d)=>
          actualStroke = stroke
          if not d.in_zebra_nappe
            actualStroke = chroma(stroke).brighten(2).desaturate(2).css()

          h IsotopeDataPoint, {
            datum: d,
            stroke: actualStroke
            strokeWidth: 4
          }
        h.if(@props.showLines) IsotopeDataLine, {
          values: values.filter (d)->d.in_zebra_nappe
          stroke: chroma(stroke).alpha(0.1).css()
          strokeWidth: 3
        }
        h IsotopeText, {
          datum: topDatum
          transform: "translate(10,5)"
          fill
          text: key
        }
      ]

  renderScale: =>
    {nTicks} = @props
    {xScale} = @context
    v = xScale.ticks(nTicks)
    h 'g.scale', v.map (d)->
      h ScaleLine, {value: d, labelBottom: true}

partialScale = (scale, domain)->
  scale.copy()
    .domain domain
    .range domain.map(scale)

MinimalColumnScale = (props)->
  {system} = props
  {xScale, pixelHeight} = useContext(ColumnLayoutContext)
  label = if system == 'delta13c' then 'δ¹³C' else 'δ¹⁸O'

  h 'g.scale.isotope-scale-axis', [
    h ScaleLine, {value: 0, stroke: '#ddd'}
    h ScaleLine, {value: -8, stroke: '#ddd', strokeDasharray: '2 6'}
    h AxisBottom, {
      scale: xScale
      rangePadding: -4
      tickLength: 3
      tickValues: [-8,0]
      top: pixelHeight
      tickLabelProps: (tickValue, i)->
        # Compensate for negative sign
        if tickValue < 0
          dx = -2
        return {
          dy: '-1px', dx, fontSize: 10,
          textAnchor: 'middle', fill: '#aaa'
        }
      labelOffset: 0
      label
    }
  ]

class MinimalIsotopesColumnInner extends Component
  @contextType: ColumnLayoutContext
  @defaultProps: {
    visible: false
    label: 'δ¹³C'
    system: 'delta13c'
    offsetTop: null
    colorScheme: d3.schemeCategory10
    correctIsotopeRatios: false
    padding:
      left: 10
      top: 10
      right: 10
      bottom: 30
  }

  @propTypes: {
    section: T.string.isRequired
    isotopes: T.arrayOf(T.object).isRequired
  }

  render: ->
    {
      padding, label, transform,
      system, corrected, label
      correctIsotopeRatios
      isotopes
    } = @props
    {width: innerWidth, xScale} = @context
    {left, top, right, bottom} = padding

    stroke = if system == 'delta13c' then 'dodgerblue' else 'red'

    h 'g.isotopes-column', {transform}, [
      h MinimalColumnScale, {system}
      h IsotopesDataArea, {
        system,
        correctIsotopeRatios
        getHeight: (d)->
          d.orig_height
      }, [
        h 'g.data-points', isotopes.map (d)=>
          h IsotopeDataPoint, {
            datum: d,
            stroke,
            strokeWidth: 4
        }
        h.if(@props.showLines) IsotopeDataLine, {
          values: isotopes
          stroke
        }
      ]
    ]


IsotopesColumn = (props)->
  {width, domain, rest...} = props
  isotopes = useIsotopes()
  h CrossAxisLayoutProvider, {width, domain}, (
    h IsotopesColumnInner, {isotopes, rest...}
  )

IsotopesColumn.propTypes = {
  width: T.number.isRequired
  domain: T.arrayOf(T.number).isRequired
}

IsotopesColumn.defaultProps = {
  domain: [-14, 6]
  width: 100
  nTicks: 6
}

MinimalIsotopesColumn = (props)->
  {width, domain, section, rest...} = props
  {correctIsotopeRatios} = useSettings()
  isotopes = useIsotopes()
  return null unless isotopes?
  vals = isotopes.get(section)
  return null unless vals?
  h CrossAxisLayoutProvider, {width, domain}, (
    h MinimalIsotopesColumnInner, {
      correctIsotopeRatios,
      isotopes: vals,
      section
      rest...
    }
  )

MinimalIsotopesColumn.defaultProps = IsotopesColumn.defaultProps

export {IsotopesColumn, MinimalIsotopesColumn}
