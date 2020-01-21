import h from 'react-hyperscript'
import sql from '../sql/generalized-section.sql'
import {useQuery} from "~/db"
import {useContext} from 'react'
import {ColumnDivisionsContext} from '../column/data-source'
import breakQuery from './breaks.sql'
import {group} from 'd3-array'

interface GeneralizedBreak {
  locality: string,
  surface: number,
  upper_section: string,
  lower_section: string
}

const GeneralizedDivisionsProvider = (props)=>{
  /*
  Provides all surfaces used in Summary Sections diagram
  */
  const {children} = props
  const divisions = useQuery(sql) ?? []

  const {divisions: allDivisions} = useContext(ColumnDivisionsContext)
  const breaks = useQuery<GeneralizedBreak[]>(breakQuery)

  if (breaks == null) return null

  const groupedBreaks = group(breaks, d => d.locality)



  Array.from(groupedBreaks).map(entry => {
    // Do for each group of Sections
    let breaks: GeneralizedBreak[] = entry[1]
    let items: GeneralizedBreak[]
    let nextBreak: GeneralizedBreak

    nextBreak = breaks.shift()
    let orderedBreaks = [nextBreak]
    while (breaks.length > 0) {
      let ix = breaks.findIndex(d => d.lower_section == orderedBreaks[orderedBreaks.length-1].upper_section)
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

    console.log(orderedBreaks)

  })


  //console.log(allDivisions, divisions, breaks)
  return h(ColumnDivisionsContext.Provider, {value: {divisions}}, children)
}

export {GeneralizedDivisionsProvider, ColumnDivisionsContext}
