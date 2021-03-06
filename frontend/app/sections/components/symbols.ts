import h from "react-hyperscript";
import { createContext, useContext } from "react";
import { SymbolColumn } from "@macrostrat/column-components";
import { useQuery } from "~/db";
import sql from "../sql/symbols.sql";

interface Symbol {
  id: number;
  section_id: string;
  symbol: string;
  symbol_min_zoom: number;
  height: number;
  start_height: number;
  end_height: number | null;
}

const SymbolContext = createContext<Symbol[]>(null);

const SymbolProvider = (props) => {
  const { children } = props;
  const symbols: Symbol[] = useQuery(sql) ?? [];
  return h(SymbolContext.Provider, { value: symbols }, children);
};

const useSymbols = (id: string) => {
  const symbols = useContext(SymbolContext) ?? [];
  return symbols.filter((d) => d.section_id == id);
};

const ManagedSymbolColumn = (props) => {
  const { id, ...rest } = props;
  const symbols = useSymbols(id);
  return h(SymbolColumn, { symbols, ...rest });
};

export { SymbolProvider, SymbolContext, ManagedSymbolColumn };
