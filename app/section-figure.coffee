import * as d3 from "d3"
import h from 'react-hyperscript'
import {SummarySections} from './sections/summary-sections'

fn = (props)->
  #h 'div'
  h SummarySections

fn.isReactComponent = true

export default fn


