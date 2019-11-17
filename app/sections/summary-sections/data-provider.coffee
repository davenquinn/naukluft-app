import {useEffect, createContext, useState} from 'react'
import h from 'react-hyperscript'
import lithostratSurface from './sql/lithostratigraphy-surface.sql'
import {query} from "../../db"

SectionSurfacesContext = createContext()

SectionSurfacesProvider = (props)->
  {children} = props
  [state, setState] = useState({surfaces: []})

  getData = ->
    query(lithostratSurface)
      .then (surfaces)->
        surfaces.reverse()
        setState {surfaces}
    return

  useEffect getData, []

  h SectionSurfacesContext.Provider, {
    value: state
  }, children

export {SectionSurfacesContext, SectionSurfacesProvider}
