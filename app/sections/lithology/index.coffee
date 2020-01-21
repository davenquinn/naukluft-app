import {Component} from "react"
import h from "react-hyperscript"
import {db, storedProcedure, query} from "../../db"
import {LithologyProvider} from '@macrostrat/column-components'
import q from "./lithology.sql"

class OurLithologyProvider extends Component
  constructor: (props)->
    super props
    @state = {lithologies: []}

  getLithologies: =>
    lithologies = await query(q)
    @setState {lithologies}

  componentDidMount: ->
    @getLithologies()

  render: ->
    {lithologies} = @state
    {children} = @props
    h LithologyProvider, {lithologies}, children

export {OurLithologyProvider as LithologyProvider}
