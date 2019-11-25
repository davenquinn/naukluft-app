import h from '@macrostrat/hyper'
import {render} from 'react-dom'
import {RegionalSections} from './main'
import {StaticFigureWrapper} from '../summary-sections/static-figure/wrapper'

RegionalSectionsFigure = (props)->
  h StaticFigureWrapper, [
    h RegionalSections
  ]

wrapper = (el, opts, cb)->
  render(h(RegionalSectionsFigure), el, cb)

export default wrapper
