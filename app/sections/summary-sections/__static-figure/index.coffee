import h from 'react-hyperscript'
import {render} from 'react-dom'
import {SummarySectionsStatic} from '../index'
import {SectionConsumer} from '~/sections/section-data'
import {StaticFigureWrapper} from '~/__static-figure/wrapper'

fn = (props)->
  h StaticFigureWrapper, [
    h SummarySectionsStatic, {sections}
  ]


wrapper = (el, opts, cb)->
  render(h(fn), el, cb)

export default wrapper
