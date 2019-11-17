import h from 'react-hyperscript'
import {render} from 'react-dom'
import {PlatformProvider} from '../../../platform'
import {SummarySectionsFigure} from './main'
import {SectionDataProvider, SectionConsumer} from '../../section-data'
import '../../../main.styl'
import '../../main.styl'
import '../main.styl'
import '../../../bundled-deps/column-components/src/main.styl'

fn = (props)->
  h PlatformProvider, [
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
