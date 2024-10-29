import { hyperStyled, compose } from "@macrostrat/hyper";
import { group } from "d3-array";
import { ColumnDivisionsContext } from "~/sections/summary-sections/generalized/data-provider";
import { useContext } from "react";
import { useCanvasSize } from "../components/link-overlay";
import { updateSectionE } from "./helpers";
import { SequenceCorrelations } from "./sequence";
import {
  GeneralizedDivisionsProvider,
  GeneralizedSurfacesProvider,
} from "~/sections/summary-sections/generalized/data-provider";
import { SettingsProvider } from "../summary-sections/settings";

import "../summary-sections/main.module.styl";
import styles from "~/sections/summary-sections/generalized/main.module.styl";
import styles2 from "./main.module.styl";
const h = hyperStyled({ ...styles, ...styles2 });

const RegionalSectionsContainer = compose(
  GeneralizedDivisionsProvider,
  GeneralizedSurfacesProvider,
  SettingsProvider,
);

const SectionPane = function (props) {
  const { divisions } = useContext(ColumnDivisionsContext);
  const { children } = props;
  const sz = useCanvasSize();
  const divisionMap = group(divisions, (s) => s.section_id);
  const sections = Array.from(divisionMap, function ([key, divisions]) {
    divisions.sort((a, b) => a.bottom - b.bottom);
    return { key, divisions };
  });

  updateSectionE(sections);

  const order = ["Onis", "Ubisis", "Tsams"];
  sections.sort((a, b) => order.indexOf(a.key) - order.indexOf(b.key));

  return h("div.section-pane-static", { style: { position: "relative" } }, [
    h(SequenceCorrelations, {
      id: "S3",
      offsets: {
        Onis: 0,
        Ubisis: 265,
        Tsams: 160,
      },
      sections,
      bottomSurface: 15,
    }),
    h(SequenceCorrelations, {
      id: "S2",
      offsets: {
        Onis: 0,
        Ubisis: 0,
        Tsams: 0,
      },
      sections,
      topSurface: 15,
      bottomSurface: 1,
      // Or 20 if we want the correlating sequence boundary
      paddingBottom: 35,
    }),
    h(SequenceCorrelations, {
      id: "S1",
      offsets: {
        Onis: 0,
        Ubisis: 0,
        Tsams: 0,
      },
      sections,
      topSurface: 1,
    }),
    children,
  ]);
};

const RegionalSections = (props) => {
  return h(RegionalSectionsContainer, null, h(SectionPane, props));
};

export { RegionalSections };
