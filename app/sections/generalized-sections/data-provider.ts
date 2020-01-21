import h from 'react-hyperscript'
import sql from '../sql/generalized-section.sql'
import {useQuery} from "~/db"
import {useContext} from 'react'
import {ColumnDivisionsContext} from '../column/data-source'

const GeneralizedDivisionsProvider = (props)=>{
  /*
  Provides all surfaces used in Summary Sections diagram
  */
  const {children} = props
  const divisions = useQuery(sql)
  if (divisions == null) return null
  return h(ColumnDivisionsContext.Provider, {value: {divisions}}, children)
}

export {GeneralizedDivisionsProvider, ColumnDivisionsContext}
