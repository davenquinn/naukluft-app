import T from 'prop-types'
import h from '@macrostrat/hyper'
import {Component} from 'react'

class FilledTopology extends Component
  @propTypes: {
    getFill: T.func.isRequired
  }
  render: ->
    {polygons} = @props
    return null unless polygons?
    h 'g.polygons', polygons.map (p, i)->
      {facies_id, geometry} = p
      fill = schemeSet3[i%12]
      if facies_id?
        fill = "url(#pattern-#{facies_ix[facies_id][0]})"
      h 'path', {d: generator(geometry), key: i, fill}

export {FilledTopology}
