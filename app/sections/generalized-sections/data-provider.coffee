import {useEffect, createContext, useState} from 'react'
import h from 'react-hyperscript'
import sql from '../sql/generalized-section.sql'
import {query} from "../../db"

###
This could probably be merged into a more
general query provider...
###
GeneralizedSurfacesContext = createContext()
GeneralizedSurfacesProvider = (props)->
  {children} = props
  [state, setState] = useState({surfaces: []})

  getData = ->
    query(sql).then (surfaces)->
      surfaces.reverse()
      setState {surfaces}
    return

  useEffect getData, []

  h GeneralizedSurfacesContext.Provider, {
    value: state
  }, children

export {
  GeneralizedSurfacesContext,
  GeneralizedSurfacesProvider
}
