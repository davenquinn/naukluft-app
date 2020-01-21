import {query, storedProcedure} from "~/sections/db"
import {format} from "d3-format"
import {Component} from "react"
import {ColumnContext} from "@macrostrat/column-components/dist/cjs/context"
import h from "react-hyperscript"
import sectionSamplesQuery from '../sql/section-samples.sql'

fmt = format('+.1f')

class Samples extends Component
  @contextType: ColumnContext
  constructor: (props)->
    super props
    @state = {samples: []}
    @getSamples()

  getSamples: ->
    samples = await query sectionSamplesQuery, [@props.id]
    @setState {samples}

  render: ->
    {scale, zoom} = @context
    {samples} = @state

    h 'g.samples', {},
      samples.map (d)->
        y = scale(d.height)
        x = -30
        transform = "translate(#{x} #{y})"
        h "g.sample", {transform, key: d.analysis_id}, [
          h "circle", {cx: 0, cy: 0, r: 2*zoom}
          h "text", {x: -10, y: -5}, "∂¹³C "+fmt(d.avg_delta13c)
          h "text", {x: -10, y: 5}, "∂¹⁸O "+fmt(d.avg_delta18o)
        ]

export default Samples
