import h from 'react-hyperscript'
import sql from '../sql/generalized-section.sql'
import {useQuery} from "~/db"
import {ColumnDivisionsContext} from '../column/data-source'

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

  return h(ColumnDivisionsContext.Provider, {value: {divisions}}, children)
}

export {GeneralizedDivisionsProvider, ColumnDivisionsContext}
