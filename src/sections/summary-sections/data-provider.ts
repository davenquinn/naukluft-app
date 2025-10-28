import { useContext } from "react";
import h from "@macrostrat/hyper";
import { SectionDataContext } from "../data-providers";
import { ColumnProvider } from "@macrostrat/column-components";
import { useColumnDivisions } from "~/sections/column";

const defaultFilterDivisions = (d) => !d.schematic;

export function SummaryColumnProvider(props) {
  /*
  Centralized provider for a single column
  identified by ID.
  */
  const {
    id,
    zoom = 0.1,
    children,
    filterDivisions = defaultFilterDivisions,
    pixelsPerMeter,
  } = props;

  const sections = useContext(SectionDataContext);
  if (sections == null) return null;
  const row = sections.find((d) => d.id == id);

  let divisions = useColumnDivisions(id);
  if (filterDivisions != null) {
    divisions = divisions.filter(filterDivisions);
  }

  if (row == null) {
    throw new Error(`Section with id ${id} not found`);
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
    pixelsPerMeter,
    children,
  });
}
