import { createContext, useContext } from "react";
import h from "@macrostrat/hyper";
import { useUpdateableQuery } from "naukluft-data-backend";

enum SurfaceType {
  MaximumFloodingSurface = "mfs",
  SequenceBoundary = "sb",
}

interface SectionHeight {
  certainty: number;
  height: number;
  inferred: boolean;
  section: string;
}

declare interface SectionSurface {
  surface_id: number;
  surface_order: number;
  surface_type: SurfaceType | null;
  note: string;
  correlative: boolean;
  section_height: SectionHeight[];
}

interface SectionSurfaceCtx {
  surfaces: SectionSurface[];
  updateSurfaces(): void;
}

const SectionSurfacesContext = createContext<SectionSurfaceCtx | null>(null);

const SectionSurfacesProvider = (props) => {
  /*
  Provides all surfaces used in Summary Sections diagram
  */
  const { children } = props;
  const [surfaces, updateSurfaces] = useUpdateableQuery(
    "sections/all-surfaces",
  );

  if (surfaces == null) return null;
  return h(
    SectionSurfacesContext.Provider,
    { value: { surfaces, updateSurfaces } },
    children,
  );
};

const useSurfaces = () => useContext(SectionSurfacesContext)?.surfaces ?? [];

export { SectionSurfacesContext, SectionSurfacesProvider, useSurfaces };
