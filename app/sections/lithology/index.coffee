import {Component, createContext} from "react"
import h from "react-hyperscript"
import {db, storedProcedure, query} from "../../db"
import q from "./sql/lithology.sql"

LithologyContext = createContext {lithology: []}

class LithologyProvider extends Component
  constructor: (props)->
    super props
    @state = {lithology: []}

  getLithologies: =>
    lithology = await query(q)
    @setState {lithology}

  componentDidMount: ->
    @getLithologies()

  render: ->
    {lithology} = @state
    {children, rest...} = @props
    value = {lithology}
    h LithologyContext.Provider, {value}, children

export {LithologyProvider, LithologyContext}
