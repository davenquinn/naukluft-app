import {createContext} from 'react'
import h from 'react-hyperscript'
import surfacesQuery from './all-surfaces.sql'
import {useUpdateableQuery} from "~/db"

declare interface SectionSurface {
  surface_id: number
}

interface SectionSurfaceCtx {
  surfaces: SectionSurface[],
  updateSurfaces(): void
}

const SectionSurfacesContext = createContext<SectionSurfaceCtx|null>(null)

const SectionSurfacesProvider = (props)=>{
  /*
  Provides all surfaces used in Summary Sections diagram
  */
  const {children} = props
  const [surfaces, updateSurfaces] = useUpdateableQuery(surfacesQuery)

  if (surfaces == null) return null
  return h(SectionSurfacesContext.Provider, {value: {surfaces, updateSurfaces}}, children)
}

export {SectionSurfacesContext, SectionSurfacesProvider}
