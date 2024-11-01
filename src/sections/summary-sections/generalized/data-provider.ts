import h, { compose, C } from "@macrostrat/hyper";
import { useQuery } from "naukluft-data-backend";
import { useContext, createContext } from "react";
import {
  ColumnDivision,
  ColumnDivisionsContext,
} from "../../column/data-source";
import { EditorProvider, EditorContext } from "../editor";
import { SectionSurfacesContext } from "~/sections/providers";
import { SectionDataContext } from "../../data-providers";
import { SymbolContext } from "../../components/symbols";
import { GeneralizedDivision } from "./types";
import { group, pairs } from "d3-array";
import { last } from "underscore";

interface SectionBreak {
  surface: number;
  upper_section: string;
  lower_section: string;
}

interface SectionRange {
  section: string;
  lower_surface: number;
  upper_surface: number;
}

interface GeneralizedBreak extends SectionBreak {
  locality: string;
}

function orderBreaks(breaks: SectionBreak[]): SectionBreak[] {
  /* Order section breaks in ascending (upper_surface == next lower surface) order.
     Should be provided with a series of connecting breaks */
  let orderedBreaks = [breaks.shift()];
  let items: GeneralizedBreak[];
  while (breaks.length > 0) {
    let ix = breaks.findIndex(
      (d) => d.lower_section == last(orderedBreaks).upper_section,
    );
    if (ix != -1) {
      items = breaks.splice(ix, 1);
      orderedBreaks.push(...items);
      continue;
    }
    ix = breaks.findIndex(
      (d) => d.upper_section == orderedBreaks[0].lower_section,
    );
    if (ix != -1) {
      items = breaks.splice(ix, 1);
      orderedBreaks.unshift(...items);
      continue;
    }
    throw "Section breaks must be defined by 'upper_section', 'lower_section' pairs";
  }
  console.log(orderedBreaks);
  return orderedBreaks;
}

function calculateSectionRanges(breaks: SectionBreak[]) {
  let sectionRanges: SectionRange[] = [];
  const orderedBreaks = orderBreaks(breaks);

  /* Extend on edges to account for possible sections
     without externally-defined boundaries */
  const first = orderedBreaks[0];
  if (first.lower_section != null) {
    orderedBreaks.unshift({
      lower_section: null,
      upper_section: first.lower_section,
      surface: null,
    });
  }
  const last = orderedBreaks[orderedBreaks.length - 1];
  if (last.upper_section != null) {
    orderedBreaks.push({
      lower_section: last.upper_section,
      upper_section: null,
      surface: null,
    });
  }

  const breakPairs = pairs(orderedBreaks);
  for (const [b0, b1] of breakPairs) {
    if (b0.upper_section != b1.lower_section)
      throw "Breaks are not paired correctly";
    sectionRanges.push({
      section: b0.upper_section,
      lower_surface: b0.surface,
      upper_surface: b1.surface,
    });
  }
  return sectionRanges;
}

interface ExtraArgs {
  [ix: string]: any;
}

function generalize(
  divs: ColumnDivision[],
  start_height: number,
  section_id: string,
): GeneralizedDivision[] {
  let newBottom = start_height;
  return divs.map((d) => {
    const {
      section_id: original_section,
      top: original_top,
      bottom: original_bottom,
      ...rest
    } = d;

    let height = original_top - original_bottom;

    const bottom = newBottom;
    const top = newBottom + height;
    newBottom += height;

    return {
      original_section,
      section_id,
      top,
      bottom,
      original_top,
      original_bottom,
      ...rest,
    };
  });
}

class SectionHeightGeneralizer {
  // Generalizer based on individual divisions of a column.
  // There's probably a better way to do this...
  divisions: GeneralizedDivision[];
  constructor(divisions: GeneralizedDivision[]) {
    this.divisions = divisions;
  }
  findMatchingInterval(sectionID: string, height: number) {
    return (
      this.divisions.find(
        (d) =>
          d.original_section == sectionID &&
          d.original_bottom <= height &&
          d.original_top >= height,
      ) ?? null
    );
  }

  _generalizeHeight(interval: GeneralizedDivision, height: number) {
    return interval.bottom + (height - interval.original_bottom);
  }

  generalizeHeight(sectionID: string, height: number): number | null {
    const interval = this.findMatchingInterval(sectionID, height);
    if (interval == null) return null;
    return this._generalizeHeight(interval, height);
  }
}

// A context for to pass along ungrouped divisions
const BaseDivisionsContext = createContext<ColumnDivision[]>([]);

const GeneralizedDivisionsProvider = (props) => {
  /*
  Provides all surfaces used in Summary Sections diagram
  */
  const sectionData = useContext(SectionDataContext);
  let allDivisions = useContext(ColumnDivisionsContext).divisions;
  if (allDivisions.length == 0) {
    console.error("ColumnDivisionsContext must be provided.");
    return null;
  }
  // sorting of input is not guaranteed
  allDivisions.sort((a, b) => a.bottom - b.bottom);

  const breaks = useQuery<GeneralizedBreak[]>("sections/generalized/breaks");
  if (breaks == null) return null;

  const groupedBreaks = group<GeneralizedBreak, string>(
    breaks,
    (d) => d.locality,
  );
  let divisions: GeneralizedDivision[] = [];

  for (const [locality, breaks] of Array.from(groupedBreaks)) {
    divisions.push({
      section_id: locality,
      bottom: -50,
      top: 0,
      surface_type: "mfs",
      surface_order: 0,
      original_section: null,
    });
    let baseOffset = 0;
    const sectionRanges = calculateSectionRanges(breaks);
    for (const range of sectionRanges) {
      // Filter within each section range to get only the required divisions
      const section = sectionData.find((d) => d.section == range.section)!;

      let sectionDivisions = allDivisions.filter(
        (d) => d.section_id == range.section && !(d.schematic ?? false),
      );
      let bottomIx = 0,
        topIx = sectionDivisions.length;
      if (range.lower_surface != null) {
        bottomIx = sectionDivisions.findIndex(
          (d) => d.surface == range.lower_surface,
        );
      }
      if (range.upper_surface != null) {
        topIx = sectionDivisions.findIndex(
          (d) => d.surface == range.upper_surface,
        );
      }

      if (["G", "A"].includes(range.section)) {
        bottomIx = 1; // A hack; we need to find a better way to identify this division
      }

      //console.log(sectionDivisions.length, bottomIx, topIx)
      sectionDivisions = sectionDivisions.slice(bottomIx, topIx);
      //const innerDivisions = sectionDivisions.filter(d => d.top > section.start && d.bottom < section.end)
      let topHeight = last(sectionDivisions).top;
      let bottomHeight = sectionDivisions[0].bottom;

      const height = topHeight - bottomHeight;
      divisions.push(...generalize(sectionDivisions, baseOffset, locality));
      baseOffset += height;
    }
  }
  // We should probably provide a pre-grouped map instead of a filterable list
  return h(
    BaseDivisionsContext.Provider,
    { value: allDivisions },
    h(
      ColumnDivisionsContext.Provider,
      { value: { divisions, generalized: true } },
      props.children,
    ),
  );
};

function useGeneralizedDivisions(): GeneralizedDivision[] {
  const value = useContext(ColumnDivisionsContext);
  const isGeneralized = value?.generalized ?? false;
  if (!isGeneralized) return [];
  return value.divisions as GeneralizedDivision[];
}

// Surfaces

const match = (d, v): boolean => {
  return d.original_section == v.section && d.original_bottom == v.height;
};

function compactMap<A, B>(arr: A[], mapper: (arg0: A) => B): B[] {
  return arr.map(mapper).filter((d) => d != null);
}

const GeneralizedSurfacesProvider = (props) => {
  // Repackage section surfaces with respect to new generalized sections
  const { surfaces, updateSurfaces } = useContext(SectionSurfacesContext);
  const { divisions } = useContext(ColumnDivisionsContext);

  const newSurfaces = surfaces.map((surface) => {
    const section_height = compactMap(surface.section_height, (v) => {
      const div = divisions.find((d) => match(d, v));
      if (div == null) return null;
      return { ...v, height: div.bottom, section: div.section_id };
    });
    return { ...surface, section_height };
  });

  const value = { surfaces: newSurfaces, updateSurfaces };

  return h(SectionSurfacesContext.Provider, { value }, props.children);
};

const matchDivisions = (a: GeneralizedDivision, b: ColumnDivision): boolean => {
  return (
    a?.original_section == b?.section_id && a?.original_bottom == b?.bottom
  );
};

const GeneralizedEditorProvider = (props) => {
  const { onEditInterval, editingInterval } = useContext(EditorContext);
  const allDivisions = useContext(BaseDivisionsContext);
  const { divisions } = useContext(ColumnDivisionsContext);

  // Must be a child of GeneralizedDivisionsProvider
  const onEditGeneralizedInterval = (interval: GeneralizedDivision) => {
    const v = allDivisions.find((d) => matchDivisions(interval, d));
    onEditInterval(v);
  };

  const generalizedEditInterval = divisions?.find((d: GeneralizedDivision) =>
    matchDivisions(d, editingInterval),
  );

  return h(
    EditorContext.Provider,
    {
      value: {
        editingInterval: generalizedEditInterval,
        onEditInterval: onEditGeneralizedInterval,
      },
    },
    props.children,
  );
};

// Symbols

const GeneralizedSymbolProvider = (props) => {
  const symbols = useQuery("sections/symbols") ?? [];
  const { divisions } = useContext(ColumnDivisionsContext);
  const generalizer = new SectionHeightGeneralizer(divisions);

  let newSymbols: Symbol[] = [];
  for (let s of symbols) {
    const div = generalizer.findMatchingInterval(s.section_id, s.height);
    if (div == null) continue;
    const height = generalizer._generalizeHeight(div, s.height);
    const section_id = div.section_id;
    newSymbols.push({ ...s, height, section_id, _section_id: s.section_id });
  }

  return h(SymbolContext.Provider, { value: newSymbols }, props.children);
};

const GeneralizedDataProvider = compose(
  EditorProvider,
  GeneralizedDivisionsProvider,
  GeneralizedSymbolProvider,
  GeneralizedEditorProvider,
  GeneralizedSurfacesProvider,
);

export {
  GeneralizedDivisionsProvider,
  GeneralizedDataProvider,
  GeneralizedSurfacesProvider,
  ColumnDivisionsContext,
  SectionHeightGeneralizer,
  useGeneralizedDivisions,
};
