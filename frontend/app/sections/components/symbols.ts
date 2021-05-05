import h from "@macrostrat/hyper";
import React, { createContext, useContext } from "react";
import { SymbolColumn } from "@macrostrat/column-components";
import { useQuery } from "naukluft-data-backend";

interface Symbol {
  id: number;
  section_id: string;
  symbol: string;
  symbol_min_zoom: number;
  height: number;
  start_height: number;
  end_height: number | null;
}

const SymbolContext = createContext<Symbol[]>([]);

const SymbolProvider = (props: { children: React.ReactNode }) => {
  const { children } = props;
  const symbols: Symbol[] = useQuery("sections/symbols") ?? [];
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
