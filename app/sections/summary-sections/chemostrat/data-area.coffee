import {line} from 'd3-shape'
import {createContext, useContext} from "react"
import h from "@macrostrat/hyper"
import {ColumnLayoutContext} from '#'
import T from 'prop-types'

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
  {xScale, scale, getHeight, rest...} = opts
  val = valueAtStdev(rest)
  (d, s=0)->
    v = val(d, s)
    [xScale(v), scale(getHeight(d))]

IsotopesDataContext = createContext()

IsotopesDataArea = (props)->
  {xScale, scale} = useContext(ColumnLayoutContext)
  {corrected, system, children, getHeight} = props
  getHeight ?= (d)->
    if not d.height?
      console.log d
    d.height

  # Handlers for creating points and lines
  pointLocator = createPointLocator({xScale, scale, corrected, system, getHeight})

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
