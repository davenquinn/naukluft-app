import {withRouter} from "react-router-dom"
import {findDOMNode} from "react-dom"
import * as d3 from "d3"
import {line} from 'd3-shape'
import "d3-selection-multi"
import {Component, createElement, createContext, useContext} from "react"
import h from "@macrostrat/hyper"
import Measure from 'react-measure'
import {SectionAxis} from "#/axis"
import classNames from "classnames"
import chroma from "chroma-js"

import {sectionSurfaceProps} from '../link-overlay'
import {query} from "../../db"
import sql from '../../sql/carbon-isotopes.sql'
import allCarbonIsotopes from '../../sql/all-carbon-isotopes.sql'

import {
  ColumnSVG,
  CrossAxisLayoutProvider,
  ColumnLayoutContext
} from '#'
import T from 'prop-types'

fmt = d3.format('.1f')

valueAtStdev = (opts)->
  {system, corrected} = opts
  corrected ?= false
  system ?= 'delta13c'
  if corrected
    system += "_corr"
  (d, s=0)->
    v = d['avg_'+system]
    if s != 0
      v += d['std_'+system]*s
    return v

createPointLocator = (opts)->
  {xScale, scale, rest...} = opts
  val = valueAtStdev(rest)
  (d, s=0)->
    v = val(d, s)
    [xScale(v), scale(parseFloat(d.height))]

IsotopesDataContext = createContext()

IsotopesDataArea = (props)->
  {xScale, scale} = useContext(ColumnLayoutContext)
  {corrected, system, children} = props

  # Handlers for creating points and lines
  pointLocator = createPointLocator({xScale, scale, corrected, system})

  column = 'avg_'+system
  if corrected
    column += '_corr'
  lineLocator = line()
      .x (d)->xScale(d[column])
      .y (d)->scale(d.height)

  value = {pointLocator, lineLocator, corrected, system}
  h IsotopesDataContext.Provider, {value}, (
    h('g.data', null, children)
  )

IsotopeDataPoint = (props)->
  {pointLocator} = useContext(IsotopesDataContext)
  {datum, rest...} = props
  [x1,y1] = pointLocator(datum, -2)
  [x2,y2] = pointLocator(datum, 2)
  h 'line', {
    key: datum.analysis_id
    x1,y1,
    x2,y2,
    strokeLinecap: 'round'
    rest...
  }

IsotopeDataPoint.propTypes = {
  datum: T.object.isRequired
}

IsotopeDataLine = (props)->
  {values, rest...} = props
  {lineLocator} = useContext(IsotopesDataContext)
  h 'path', {
    d: lineLocator(lineValues)
    fill:'transparent'
    rest...
  }

useDataLocator = ->
  useContext(IsotopesDataContext)

export {
  IsotopesDataArea,
  IsotopeDataPoint,
  IsotopeDataLine,
  useDataLocator
}
