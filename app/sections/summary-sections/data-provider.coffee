import {createContext} from 'react'
import h from 'react-hyperscript'
import {nest} from "d3-collection"
import lithostratSurface from './sql/lithostratigraphy-surface.sql'
import {useQuery} from "~/db"

SectionSurfacesContext = createContext()

SectionSurfacesProvider = (props)->
  {children} = props
  surfaces = useQuery(lithostratSurface)
  return null unless surfaces?
  h(SectionSurfacesContext.Provider, {value: {surfaces}}, children)

export {SectionSurfacesContext, SectionSurfacesProvider}
