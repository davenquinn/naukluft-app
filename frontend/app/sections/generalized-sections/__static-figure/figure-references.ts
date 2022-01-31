import {
  sectionSwatches,
  SwatchData
} from "~/sections/section-details/swatch-data";
import { useColumn } from "@macrostrat/column-components";
import {
  SectionHeightGeneralizer,
  useGeneralizedDivisions
} from "../data-provider";
import { GeneralizedDivision } from "../types";
import h from "@macrostrat/hyper";

const allSwatches = () => {
  let swatches: SwatchData[] = [];
  for (const [key, entry] of Object.entries(sectionSwatches)) {
    swatches.push(...entry);
  }
  return swatches;
};

const generalizedSwatches = (
  divisions: GeneralizedDivision[]
): SwatchData[] => {
  const generalizer = new SectionHeightGeneralizer(divisions ?? []);
  return allSwatches().map(d => {
    const div = generalizer.findMatchingInterval(d.sectionID, d.range[0]);
    if (div == null) return d;
    return {
      id: d.id,
      sectionID: div.section_id,
      range: d.range.map(v => generalizer.generalizeHeight(d.sectionID, v))
    };
  });
};

function sectionFigureReferences(sectionID: string) {
  return allSwatches().filter(d => d.sectionID == sectionID);
}

function useGeneralizedFigureRefs(sectionID: string) {
  /* React hook for generalized divisions */
  const divisions = useGeneralizedDivisions();
  console.log(divisions);
  return generalizedSwatches(divisions).filter(d => d.sectionID == sectionID);
}

function SectionFigureRef(props: SwatchData) {
  const { scale } = useColumn();
  const top = scale(props.range[1]);
  const height = scale(props.range[0]) - top;
  return h(
    "div.figure-reference",
    {
      className: props.id,
      style: { position: "absolute", top, height }
    },
    [h("div.marker"), h("p.label", `${props.id.toLowerCase()}`)]
  );
}

export function SectionFigureReferences(props) {
  const { id: section_id } = useColumn();
  const swatches = useGeneralizedFigureRefs(section_id);
  return h(
    "div",
    swatches.map(d => h(SectionFigureRef, d))
  );
}
