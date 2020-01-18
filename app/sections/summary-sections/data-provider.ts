import {createContext, useContext} from 'react'
import h from 'react-hyperscript'
import lithostratSurface from './sql/lithostratigraphy-surface.sql'
import {useQuery} from "~/db"
import {SectionDataContext} from '../section-data'
import {
  ColumnProvider as BaseColumnProvider,
  ColumnContext
} from '@macrostrat/column-components'
import {useColumnSurfaces} from '../column/data-source'

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
  const {id, zoom, children, filterDivisions} = props

  const {sections} = useContext(SectionDataContext)
  const row = sections.find(d => d.id == id)

  let divisions = useColumnSurfaces(id)
  if (filterDivisions != null) {
    divisions = divisions.filter(filterDivisions)
  }

  const {start, clip_end: end} = row
  // Clip off the top of some columns...
  const height = end-start
  const range = [start, end]

  return h(BaseColumnProvider, {
    divisions,
    height,
    range,
    zoom,
    children
  })
}

ColumnProvider.defaultProps = {
  zoom: 0.1,
  // This filter should possibly always be used
  filterDivisions: d => !d.schematic
}

export {
  SectionSurfacesContext,
  SectionSurfacesProvider,
  ColumnProvider,
  ColumnContext
}
