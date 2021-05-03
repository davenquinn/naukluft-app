import { createContext, useContext } from "react";
import h from "react-hyperscript";
import { SectionDataContext } from "../data-providers";
import { ColumnProvider } from "@macrostrat/column-components";
import { useColumnDivisions } from "../column/data-source";

const SummaryColumnProvider = (props) => {
  /*
  Centralized provider for a single column
  identified by ID.
  */
  const { id, zoom, children, filterDivisions } = props;

  const sections = useContext(SectionDataContext);
  if (sections == null) return null;
  const row = sections.find((d) => d.id == id);

  let divisions = useColumnDivisions(id);
  if (filterDivisions != null) {
    divisions = divisions.filter(filterDivisions);
  }

  const { start, clip_end: end } = row;
  // Clip off the top of some columns...
  const height = end - start;
  const range = [start, end];

  return h(ColumnProvider, {
    divisions,
    height,
    range,
    zoom,
    children,
  });
};

SummaryColumnProvider.defaultProps = {
  zoom: 0.1,
  // This filter should possibly always be used
  filterDivisions: (d) => !d.schematic,
};

export { SummaryColumnProvider };
