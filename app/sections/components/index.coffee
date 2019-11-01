import {Component,} from "react"
import h from "@macrostrat/hyper"
import T from 'prop-types'
import {SymbolColumn} from "#/symbol-column"
import {query} from "../../db"
import sql from "../sql/section-symbols.sql"

class ManagedSymbolColumn extends Component
  constructor: (props)->
    super props
    @state = {symbols: []}
    @getData()

  getData: ->
    symbols = await query sql, [@props.id]
    @setState {symbols}

  render: ->
    {symbols} = @state
    h SymbolColumn, {symbols, @props...}

export {ManagedSymbolColumn}
