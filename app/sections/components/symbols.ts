import h from 'react-hyperscript'
import {createContext, useContext} from 'react'
import {SymbolColumn} from "@macrostrat/column-components"
import {useQuery} from "~/db"
import sql from "../sql/symbols.sql"

const SymbolContext = createContext<Symbol[]>(null)

interface Symbol {
  id: number,
  section_id: string,
  symbol: string,
  symbol_min_zoom: number
}

const SymbolProvider = (props)=>{
  const {children} = props
  const symbols: Symbol[] = useQuery(sql) ?? []
  console.log(symbols)
  return h(SymbolContext.Provider, {value: symbols}, children)
}

const useSymbols = (id: string)=>{
  const symbols = useContext(SymbolContext) ?? []
  return symbols.filter(d => d.section_id == id)
}

const ManagedSymbolColumn = (props)=>{
  const {id, ...rest} = props
  const symbols = useSymbols(id)
  return h(SymbolColumn, {symbols, ...rest})
}

export {
  SymbolProvider,
  SymbolContext,
  ManagedSymbolColumn
}
