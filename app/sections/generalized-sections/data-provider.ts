import h from 'react-hyperscript'
import sql from '../sql/generalized-section.sql'
import {useQuery} from "~/db"
import {useContext} from 'react'
import {ColumnDivision, ColumnDivisionsContext} from '../column/data-source'
import {GeneralizedDivision} from './types'
import breakQuery from './breaks.sql'
import {group, pairs} from 'd3-array'
import {last} from 'underscore'

interface GeneralizedBreak {
  locality: string,
  surface: number,
  upper_section: string,
  lower_section: string
}

function orderBreaks(breaks: GeneralizedBreak[]): GeneralizedBreak[] {
  /* Order section breaks in ascending (upper_surface == next lower surface) order.
     Should be provided with a series of connecting breaks */
  let orderedBreaks = [breaks.shift()]
  let items: GeneralizedBreak[]
  while (breaks.length > 0) {
    let ix = breaks.findIndex(d => d.lower_section == last(orderedBreaks).upper_section)
    if (ix != -1) {
      items = breaks.splice(ix,1)
      orderedBreaks.push(...items)
      continue
    }
    ix = breaks.findIndex(d => d.upper_section == orderedBreaks[0].lower_section)
    if (ix != -1) {
      items = breaks.splice(ix,1)
      orderedBreaks.unshift(...items)
      continue
    }
    throw "Section breaks must be defined by 'upper_section', 'lower_section' pairs"
  }
  return orderedBreaks
}

interface ExtraArgs {
  [ix: string]: any
}

function generalize(divs: ColumnDivision[], start_height: number, section_id: string): GeneralizedDivision[] {
  let newBottom = start_height
  return divs.map(d=>{
    const {
      section_id: original_section,
      top: original_top,
      bottom: original_bottom,
      ...rest
    } = d

    let height = original_top - original_bottom

    const bottom = newBottom
    const top = newBottom + height
    newBottom += height

    return {
      original_section,
      section_id,
      top,
      bottom,
      original_top,
      original_bottom,
      ...rest
    }
  })
}

const GeneralizedDivisionsProvider = (props)=>{
  /*
  Provides all surfaces used in Summary Sections diagram
  */
  const {children} = props
  const divisionsA = useQuery(sql) ?? []

  let allDivisions = useContext(ColumnDivisionsContext).divisions
  // sorting of input is not guaranteed
  allDivisions.sort((a,b)=>a.bottom-b.bottom)

  const breaks = useQuery<GeneralizedBreak[]>(breakQuery)

  if (breaks == null) return null

  const groupedBreaks = group<GeneralizedBreak, string>(breaks, d => d.locality)

  let divisions: GeneralizedDivision[] = []

  Array.from(groupedBreaks).map(entry => {
    const [locality, breaks] = entry
    // Do for each group of Sections
    const orderedBreaks = orderBreaks(breaks)

    let lastSurface: number
    orderedBreaks.forEach((currentDiv,i)=>{
      if (currentDiv.lower_section == null) return
      const colDivs = allDivisions.filter(d => d.section_id == currentDiv.lower_section)
      // Filter to remove surfaces below this index

      let firstIx: number
      if (lastSurface == null) {
        firstIx = 0
      } else {
        firstIx = colDivs.findIndex(d => d.surface == lastSurface)
      }

      // this should never be null
      let endIx = colDivs.findIndex(d => d.surface = currentDiv.surface)

      // Push onto divisions
      let startHeight = divisions[divisions.length-1]?.top ?? 0
      let nextDivs = colDivs.slice(firstIx, endIx)
      let newDivs = generalize(nextDivs, startHeight, locality)
      divisions.push(...newDivs)

      lastSurface = currentDiv.surface

      if (i < orderedBreaks.length-1) return
      // For the last break we need to consider the top
      const colDivsUpper = allDivisions.filter(d => d.section_id == currentDiv.upper_section)
      let startIx = colDivs.findIndex(d => d.surface = lastSurface)
      const lastDivs = colDivs.slice(startIx, colDivs.length)

      // Push onto divisions
      startHeight = divisions[divisions.length-1]?.top ?? 0
      newDivs = generalize(lastDivs, startHeight, locality)
      divisions.push(...newDivs)
    })
  })

  //console.log(allDivisions, divisions, breaks)
  return h(ColumnDivisionsContext.Provider, {value: {divisions}}, children)
}

export {GeneralizedDivisionsProvider, ColumnDivisionsContext}
