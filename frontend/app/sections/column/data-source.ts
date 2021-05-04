import React, { createContext, useContext } from "react";
import h from "@macrostrat/hyper";
import { useUpdateableQuery } from "~/data-backend";

interface ColumnDivision {
  section_id: string;
  id: number;
  surface: number;
  bottom: number;
  top: number;
}

interface ColumnDivisionManager {
  divisions: ColumnDivision[];
  updateDivisions: () => void;
}

const ColumnDivisionsContext = createContext<ColumnDivisionManager>({
  divisions: [],
  updateDivisions() {},
});

interface ColumnDivisionsProps {
  children: React.ReactNode;
  id: number | string | null;
  divisions?: ColumnDivision[];
}

function ColumnDivisionsProvider(props: ColumnDivisionsProps) {
  const { id, children } = props;
  const [rawDivs, updateDivisions] = useUpdateableQuery(
    "sections/section-lithology"
  );
  // This is incredibly wasteful...
  let divisions = props.divisions ?? rawDivs;
  if (id != null) {
    divisions = divisions.filter((d) => d.section_id === id);
  }

  const value = { divisions, updateDivisions };
  return h(ColumnDivisionsContext.Provider, { value }, children);
}

const useColumnDivisions = function (id: string) {
  const { divisions } = useContext(ColumnDivisionsContext);
  return divisions.filter((d) => d.section_id === id);
};

export {
  ColumnDivision,
  ColumnDivisionsContext,
  ColumnDivisionsProvider,
  useColumnDivisions,
};
