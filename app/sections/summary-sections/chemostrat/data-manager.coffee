import {createContext, useContext, Component} from 'react'
import h from '@macrostrat/hyper'
import sql from '../../sql/all-carbon-isotopes.sql'
import {group} from 'd3-array'
import {query} from "../../db"

IsotopesDataContext = createContext(null)

class IsotopesDataProvider extends Component
  constructor: (props)->
    super(props)
    @state = {
      isotopes: null
    }
    @getData()

  getData: ->
    data = await query(sql)
    isotopes = group(data, (d)->d.section)
    isotopes.forEach (values)->
      values.sort (a,b)->a.orig_height-b.orig_height
    @setState {isotopes}

  render: ->
    {children} = @props
    h IsotopesDataContext.Provider, {value: @state}, children

useIsotopes = ->
  useContext(IsotopesDataContext).isotopes

export {IsotopesDataProvider, IsotopesDataContext, useIsotopes}
