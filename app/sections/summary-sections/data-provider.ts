import {createContext, useContext} from 'react'
import h from 'react-hyperscript'
import lithostratSurface from './sql/lithostratigraphy-surface.sql'
import {useQuery} from "~/db"
import {SectionDataContext} from '../section-data'
import {ColumnProvider as BaseColumnProvider} from '@macrostrat/column-components'

const SectionSurfacesContext = createContext(null)

const SectionSurfacesProvider = (props)=>{
  /*
  Provides all surfaces used in Summary Sections diagram
  */
  const {children} = props
  const surfaces = useQuery(lithostratSurface)
  if (surfaces == null) return null
  return h(SectionSurfacesContext.Provider, {value: {surfaces}}, children)
}

const ColumnProvider = (props)=>{
  /*
  Centralized provider for a single column
  identified by ID.
  */
  const {id, zoom} = props

  const sections = useContext(SectionDataContext)
  const row = sections.filter(d => d.id == id)

  const {start, clip_end: end} = row
  // Clip off the top of some columns...
  const height = end-start
  const range = [start, end]

  let {divisions} = useContext(ColumnSurfacesContext)


  return h(BaseColumnProvider, {
    divisions,

  })
}

export {SectionSurfacesContext, SectionSurfacesProvider}
