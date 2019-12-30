import {Component, createContext} from "react"
import h from "react-hyperscript"
import {db, storedProcedure, query} from "../../db"
import {FaciesContext} from '#/context'
import setFaciesColorQuery from "./sql/set-facies-color.sql"
import faciesTractsQuery from "./sql/facies-tracts.sql"
import faciesQuery from "./sql/facies.sql"

class FaciesProvider extends Component
  constructor: (props)->
    super props
    @state = {
      facies: []
      faciesTracts: []
      __colorMap: {}
    }

  getFaciesColor: (id)=>
    {__colorMap} = @state
    return __colorMap[id] or null

  setFaciesColor: (id,color)=>
    sql = storedProcedure(setFaciesColorQuery)
    await db.none sql, {id,color}
    @getFaciesData()

  getFaciesData: =>
    facies = await query(faciesQuery)
    __colorMap = {}
    for f in facies
      __colorMap[f.id] = f.color

    @setState {facies, __colorMap}

  getFaciesTractData: =>
    faciesTracts = await query(faciesTractsQuery)
    @setState {faciesTracts}

  componentDidMount: ->
    @getFaciesData()
    @getFaciesTractData()

  render: ->
    {facies, faciesTracts} = @state
    {children, rest...} = @props
    procedures = do => {getFaciesColor, setFaciesColor} = @
    value = {
      facies
      faciesTracts
      procedures...
      rest...
    }
    h FaciesContext.Provider, {value}, children

export {FaciesContext, FaciesProvider}
