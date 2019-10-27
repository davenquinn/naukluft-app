import * as d3 from "d3"
import {SummarySections} from '../sections/summary-sections'
import h from 'react-hyperscript'

fn = (props)->
  h 'div'
  #h SummarySections

fn.isReactComponent = true

export default fn

