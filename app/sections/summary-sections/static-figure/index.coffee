import h from 'react-hyperscript'
import {render} from 'react-dom'
import {SummarySectionsFigure} from './main'
import {SectionConsumer} from '../../section-data'
import {StaticFigureWrapper} from './wrapper'

fn = (props)->
  h StaticFigureWrapper, [
    h SectionConsumer, null, ({sections})=>
      if sections.length == 0
        return h 'div'
      h SummarySectionsFigure, {sections}
  ]


wrapper = (el, opts, cb)->
  render(h(fn), el, cb)

export default wrapper
