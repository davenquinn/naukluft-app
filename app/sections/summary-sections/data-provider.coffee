import {useEffect, createContext, useState} from 'react'
import h from 'react-hyperscript'
import {nest} from "d3-collection"
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


groupSectionData = (sections, {stackGroups, groupOrder})->
  ###
  Create groups of sections
  ###
  stackGroup = (d)=>
    for g in stackGroups
      if g.indexOf(d.id) != -1
        return g
    return d.id

  indexOf = (arr)->(d)->
    arr.indexOf(d)

  __ix = indexOf(stackGroups)

  sectionGroups = nest()
    .key (d)->d.location
    .key stackGroup
    .sortKeys (a,b)->__ix(a)-__ix(b)
    .entries sections

  # Change key names to be more semantic
  for g in sectionGroups
    g.columns = g.values.map (col)->
      return col.values
    delete g.values
    g.location = g.key
    delete g.key

  __ix = indexOf(groupOrder)
  sectionGroups.sort (a,b)->__ix(a.location)-__ix(b.location)
  return sectionGroups

export {SectionSurfacesContext, SectionSurfacesProvider, groupSectionData}
