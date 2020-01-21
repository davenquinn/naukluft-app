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
  const divisions = useQuery(sql)

  const {divisions: allDivisions} = useContext(ColumnDivisionsContext)
  const breaks = useQuery<GeneralizedBreak[]>(breakQuery)

  if (breaks == null) return null

  const groupedBreaks = group(breaks, d => d.locality)



  Array.from(groupedBreaks).map(entry => {
    // Do for each group of Sections
    const [locality, breaks] = entry
    for (const b in breaks) {
      console.log(b)
    }
  })

  debugger

  console.log(allDivisions, divisions, breaks)
  return h(ColumnDivisionsContext.Provider, {value: {divisions}}, children)
}

export {GeneralizedDivisionsProvider, ColumnDivisionsContext}
