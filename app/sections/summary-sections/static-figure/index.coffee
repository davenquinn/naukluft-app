import h from 'react-hyperscript'
import {render} from 'react-dom'
import {PlatformProvider} from '../../../platform'
import {SummarySectionsFigure} from './main'
import {SectionDataProvider, SectionConsumer} from '../../section-data'
import '../../../bundled-deps/column-components/src/main.styl'
import symbols from '../../../../assets/**/*.svg'

resolveSymbol = (sym)->
  return null unless sym?
  [v1,v2] = sym.slice(0, -4).split("/")
  return __dirname+"/"+symbols[v1][v2]

fn = (props)->
  h PlatformProvider, {resolveSymbol}, [
    h SectionDataProvider, [
      h SectionConsumer, null, ({sections})=>
        if sections.length == 0
          return h 'div'
        h SummarySectionsFigure, {sections}
    ]
  ]


wrapper = (el, opts, cb)->
  render(h(fn), el, cb)

export default wrapper
