import { compose, hyperStyled } from "@macrostrat/hyper";
import { group } from "d3-array";

import { ColumnProvider, ColumnSVG } from "@macrostrat/column-components";
import { useContext } from "react";
import { SectionSurfacesProvider } from "~/sections/providers";
import { ColumnDivision, useColumnDivisions } from "../column/data-source";
import {
  SectionContainer,
  SectionLinkOverlay,
  SectionPositionProvider,
} from "../components";
import { SVGSectionInner } from "../summary-sections/column";
import { LithostratigraphyColumn } from "../summary-sections/lithostrat-key";
import { SectionFigureReferences } from "./__static-figure/figure-references";
import { Legend } from "./__static-figure/legend";
import { GeneralizedAxis, GeneralizedBreaks } from "./axis";
import { ChemostratigraphyColumn } from "./chemostrat";
import {
  ColumnDivisionsContext,
  GeneralizedDataProvider,
} from "./data-provider";

import "../summary-sections/main.module.styl";
import styles from "./main.module.styl";
const h = hyperStyled(styles);

const GeneralizedSection = function (props) {
  const { range, height, divisions, zoom, offsetTop, ...rest } = props;
  const { id } = rest;
  return h("div.section-column", { className: id }, [
    h(
      ColumnProvider,
      {
        id,
        range,
        height,
        divisions,
        zoom,
      },
      [
        h(
          SVGSectionInner,
          {
            ...rest,
            offsetTop,
            absolutePosition: false,
            axisComponent: GeneralizedAxis,
          },
          [h(GeneralizedBreaks), h(SectionFigureReferences)]
        ),
      ]
    ),
  ]);
};

const rangeForDivisions = (divisions: ColumnDivision[]): [number, number] => {
  const start = divisions[0].bottom;
  const end = divisions[divisions.length - 1].top;
  return [start, end];
};

const GeneralizedLithostratKey = (props) => {
  let {
    padding = {
      left: 5,
      top: 30,
      right: 5,
      bottom: 10,
    },
    innerWidth = 40,
    keySection = "Onis",
  } = props;
  let { left, right } = padding;

  let divisions = useColumnDivisions(keySection);
  const range = rangeForDivisions(divisions);

  // Set up number of ticks
  const transform = `translate(${left} ${padding.top})`;
  const minWidth = innerWidth + (left + right);

  return h("div", { style: { marginLeft: 20 } }, [
    h(
      "div.section-container.lithostratigraphy-names",
      {
        style: { minWidth },
      },
      [
        h(ColumnProvider, { range, divisions, zoom: 0.1 }, [
          h(ColumnSVG, { width: 50 }, [
            h("g.backdrop", { transform }, [
              h(LithostratigraphyColumn, { keySection }),
            ]),
          ]),
        ]),
      ]
    ),
  ]);
};

// Should allow switching between offset types
const stratOffsets = {
  Onis: 0,
  Ubisis: 300,
  Tsams: 200,
};

const compactOffsets = {
  Onis: 0,
  Ubisis: 270,
  Tsams: 0,
};

const SectionPane = function (props) {
  const { divisions } = useContext(ColumnDivisionsContext);
  const surfaceMap = group(divisions, (s) => s.section_id);
  const sections = Array.from(surfaceMap, function ([key, surfaces]) {
    surfaces.sort((a, b) => a.bottom - b.bottom);
    return { key, surfaces };
  });

  const order = ["Onis", "Ubisis", "Tsams"];
  sections.sort((a, b) => order.indexOf(a.key) - order.indexOf(b.key));

  const offsets = compactOffsets;

  const showChemostrat = true;

  return h("div#section-pane", [
    h(Legend),
    h(SectionContainer, [
      h(SectionLinkOverlay),
      h(GeneralizedLithostratKey, {
        zoom: 0.1,
        key: "key",
        keySection: "Onis",
        offset: 0,
      }),
      h.if(showChemostrat)(ChemostratigraphyColumn, {
        sections,
        showLines: false,
        keySection: "Onis",
      }),
      h(
        "div.generalized-sections",
        sections.map(function ({ key, surfaces }) {
          let start = 0;
          // Bottom is the first division with an assigned facies
          for (let d of Array.from(surfaces)) {
            if (d.facies != null && d.facies !== "none") {
              start = d.bottom;
              break;
            }
          }
          // Top of the last section is taken as the height
          // at which to clip off errant facies
          const end = parseFloat(surfaces[surfaces.length - 1].top);

          return h(GeneralizedSection, {
            id: key,
            zoom: 0.1,
            key,
            triangleBarRightSide: false, //key === "Onis",
            offsetTop: offsets[key],
            start,
            end,
            range: [start, end],
            height: end - start,
            divisions: surfaces,
          });
        })
      ),
    ]),
  ]);
};

const GeneralizedSections = compose(
  SectionSurfacesProvider,
  GeneralizedDataProvider,
  SectionPositionProvider,
  SectionPane
);

export { GeneralizedSections };
