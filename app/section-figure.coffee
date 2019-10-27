import * as d3 from "d3"
import h from 'react-hyperscript'
import {PlatformProvider} from './platform'
import {SectionDataProvider, SectionConsumer} from './sections/section-data'
import {SummarySectionsStatic} from './sections/summary-sections'
import './main.styl'
import './sections/main.styl'
import './sections/summary-sections/main.styl'


fn = (props)->
  #h 'div'
  h PlatformProvider, [
    h SectionDataProvider, [
      h SectionConsumer, null, ({sections})=>
        if sections.length == 0
          return h 'div'
        h SummarySectionsStatic, {sections}
    ]
  ]

fn.isReactComponent = true

export default fn
