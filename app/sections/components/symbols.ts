import h from "@macrostrat/hyper";
import {SymbolColumn} from "@macrostrat/column-components";
import {useQuery} from "~/db";
import sql from "../sql/section-symbols.sql";

const ManagedSymbolColumn = (props)=>{
  const {id, ...rest} = props
  const symbols = useQuery(sql, [id]) ?? []
  return h(SymbolColumn, {symbols, ...rest})
}

export {ManagedSymbolColumn}
