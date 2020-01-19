import {Component, createContext, useContext} from "react"
import h from "react-hyperscript"
import T from "prop-types"
import {query} from "~/db"
import q from '../sql/section-lithology.sql'

ColumnDivisionsContext = createContext {}

class ColumnDivisionsProvider extends Component
  ###
  # Makes sure divisions are defined for sections
  ###
  @propTypes: {
    id: T.string
    divisions: T.arrayOf(T.object)
  }
  constructor: (props)->
    super props
    {divisions} = @props
    if not divisions?
      divisions = []
      @updateDivisions()
    @state = {divisions}

  updateDivisions: =>
    {id} = @props
    console.log "Updating divisions for all columns."
    divisions = await query q
    if id?
      divisions = divisions.filter (d)->d.section_id == id
    @setState {divisions}

  render: ->
    {children} = @props
    {divisions} = @state
    {updateDivisions} = @
    value = {divisions, updateDivisions}
    h ColumnDivisionsContext.Provider, {value}, children

useColumnDivisions = (id)->
  {divisions} = useContext(ColumnDivisionsContext)
  divisions.filter (d)->d.section_id == id

export {ColumnDivisionsContext, ColumnDivisionsProvider, useColumnDivisions}
