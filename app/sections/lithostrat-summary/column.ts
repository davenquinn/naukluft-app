import { hyperStyled } from "@macrostrat/hyper";
import { SectionContainer } from "../components";
import { LithostratKey } from "../summary-sections/lithostrat-key";
import { Legend } from "../summary-sections/legend";
import { group } from "d3-array";
// This should be wrapped into a context
import { groupOrder } from "../summary-sections/display-parameters";
import { LayoutGroup } from "../summary-sections/layout/layout-group";
import {
  sectionOffsets,
  stackGroups,
} from "../summary-sections/display-parameters";
import { SectionPositions } from "../summary-sections/layout/defs";
import { useSectionPositions } from "../components/link-overlay";
import { useContext } from "react";
import styles from "../summary-sections/main.module.styl";
import { sectionData, sectionSurfaces, sectionSymbols } from "./data";
import "../main.styl";

import {
  GrainsizeLayoutProvider,
  ColumnSVG,
  ColumnBox,
  TriangleBars,
  GeneralizedSectionColumn,
  SimplifiedLithologyColumn,
  CoveredOverlay,
  FaciesColumnInner,
  ColumnContext,
  ColumnAxis,
  SymbolColumn,
  ColumnProvider,
} from "@macrostrat/column-components";

const h = hyperStyled(styles);

interface SectionPaneProps {
  scrollable: boolean;
  groupMargin: number;
  columnMargin: number;
  columnWidth: number;
  sections: SectionData[];
  tightenSpacing: boolean;
}

const SectionPane = function (props: SectionPaneProps) {
  let { groupMargin, columnMargin, columnWidth, tightenSpacing } = props;

  const showLegend = false;

  let { offset } = sectionData;

  return h("div#section-pane", { style: { overflow: "scroll" } }, [
    h.if(showLegend)(Legend),
    h(SectionContainer, [
      h(LithostratKey, {
        zoom: 0.1,
        key: "key",
        offset,
      }),
      h("div#section-container", [
        h(ArrangedSections, {
          groupMargin,
          columnMargin,
          columnWidth,
          tightenSpacing,
        }),
      ]),
    ]),
  ]);
};

SectionPane.defaultProps = {
  tightenSpacing: true,
  scrollable: true,
};

function ArrangedSections(props: ArrangedSectionsProps) {
  const { groupMargin, location, ...rest } = props;
  const sections = [sectionData];

  // Divide sections into groups by location
  let groups = Array.from(group(sections, (d) => d.location));
  // Group order should become a rop or context
  groups.sort(orderLike(groupOrder, (d) => d[0]));

  ///let width = Math.max(...Object.values(useSectionPositions()).map(d => d.x+d.width))

  const outerStyle = {};

  return h(
    "div.grouped-sections",
    { style: outerStyle },
    groups.map((entry, i) => {
      return h(SectionGroup, {
        key: location,
        location,
        style: {},
        sections,
        ...rest,
      });
    })
  );
}

export { SectionPane };

// This might be a bad type declaration
const orderLike = <T, U>(arr: T[], accessor: (U) => T) => {
  return (a: U, b: U): number => {
    /*
    Function to sort an array like another array
    */
    let acc =
      accessor ??
      function (d) {
        return d;
      };
    return arr.indexOf(acc(a)) - arr.indexOf(acc(b));
  };
};

interface ArrangedSectionsProps {
  sections: SectionData[];
  groupMargin: number;
  location: string;
}

function SectionColumn(props) {
  let { style } = props;
  style.position = "relative";
  style.width = style.width ?? 240;
  return h("div.section-column", { style }, props.children);
}

interface SectionGroupProps {
  sections: SectionData[];
  columnMargin: number;
  columnWidth: number;
  height: number;
  location: string;
}

const SectionGroup = (props: SectionGroupProps) => {
  const { sections, columnMargin, columnWidth, ...rest } = props;

  // Sort into columns within this group, using `stackGroups` variable
  let columns = group(sections, (d) =>
    stackGroups.findIndex((v) => v.includes(d.section))
  );
  columns = Array.from(columns);
  columns.sort((a, b) => a[0] - b[0]);
  const columnData: SectionData[][] = columns.map((a) => (a = a[1]));

  // Get topmost column position
  const sectionIDs = sections.map((d) => d.section);
  const pos: SectionPositions = useSectionPositions();
  const positions = Object.values(pos).filter((d) => sectionIDs.includes(d.id));
  const top = Math.min(...positions.map((d) => d.y));
  const height = Math.max(...positions.map((d) => d.y + d.height));
  const titleOffset = top - 120;

  return h(
    LayoutGroup,
    { titleOffset, ...rest },
    columnData.map((sections, i) => {
      let marginRight = columnMargin;

      if (i == columns.length - 1) marginRight = 0;

      const getWidth = (sections) => {
        for (let s of sections) {
          let sPos = pos[s.section];
          if (sPos != null) {
            const w = sPos.width + sPos.paddingLeft + sPos.paddingRight;
            if (w > 0) return w;
          }
        }
        return 150;
      };

      const width = getWidth(sections);
      //console.log(width)
      const style = { marginRight, height, width };

      return h(
        SectionColumn,
        { key: i, style },
        sections.map((row) => {
          let { offset } = row;
          const { start, clip_end: end, id } = row;
          offset = sectionOffsets[id] ?? offset;

          // Clip off the top of some columns...

          const height = end - start;

          return h(SVGSectionComponent, {
            zoom: 0.1,
            key: id,
            triangleBarRightSide: false,
            showCarbonIsotopes: false,
            isotopesPerSection: false,
            offsetTop: 670 - height - offset,
            range: [start, end],
            height,
            start,
            end,
            id,
          });
        })
      );
    })
  );
};

const ColumnSummaryAxis = function (props) {
  const { height, zoom, scale, pixelsPerMeter } = useContext(ColumnContext);
  const ratio = pixelsPerMeter * zoom;

  // Keep labels from inhabiting the top few pixels (to make space for section labels)
  const topPadding = 30;
  const maxVal = scale.domain()[1] - topPadding / ratio;

  return h(ColumnAxis, {
    ticks: (height * zoom) / 5,
    showLabel(d) {
      return d < maxVal;
    },
  });
};

const SVGSectionInner = function (props) {
  let { id, padding, innerWidth, offsetTop, absolutePosition } = props;

  const showTriangleBars = true;
  const sequenceStratOrder = [0, 2];

  let overallWidth = 120;
  overallWidth += 42; // Symbol column

  let triangleBarTranslate = 0;
  let mainTranslate = 0;

  let underlayPaddingLeft: number = padding.left;

  if (showTriangleBars) {
    // How many bars are we rendering?
    const nOrders = sequenceStratOrder[1] - sequenceStratOrder[0] + 1;

    //40
    const triangleBarWidth = 20 * nOrders;
    overallWidth += triangleBarWidth;
    triangleBarTranslate = 20 * (nOrders - 2);
    mainTranslate = triangleBarWidth + 8;
    underlayPaddingLeft -= 35 + triangleBarTranslate;
  }

  const grainsizeScaleStart = 40;

  return h(
    ColumnBox,
    {
      className: "section-container",
      offsetTop,
      width: overallWidth,
      marginLeft: 0,
      marginRight: 0,
      absolutePosition,
    },
    [
      h("div.section-header", [
        h("h2", { style: { zIndex: 20, marginLeft: mainTranslate } }, id),
      ]),
      h("div.section-outer", [
        h(
          GrainsizeLayoutProvider,
          {
            width: innerWidth,
            grainsizeScaleStart,
          },
          [
            h(
              ColumnSVG,
              {
                width: overallWidth,
                paddingTop: padding.top,
                paddingBottom: padding.bottom,
                paddingLeft: padding.left,
              },
              [
                h("g.main", { transform: `translate(${mainTranslate})` }, [
                  h(props.axisComponent),
                  h(GeneralizedSectionColumn, [
                    h(FaciesColumnInner),
                    h(SimplifiedLithologyColumn),
                    h(CoveredOverlay),
                  ]),
                  h(SymbolColumn, { symbols: sectionSymbols, left: 90 }),
                ]),
                h(
                  "g.sequence-strat",
                  { transform: `translate(${triangleBarTranslate})` },
                  [
                    h.if(showTriangleBars)(TriangleBars, {
                      id,
                      offsetLeft: 0,
                      lineWidth: 20,
                      minOrder: sequenceStratOrder[0],
                      maxOrder: sequenceStratOrder[1],
                    }),
                  ]
                ),
              ]
            ),
          ]
        ),
        h(
          "div.section-children",
          {
            style: {
              marginTop: padding.top,
              marginLeft: padding.left + mainTranslate,
            },
          },
          [props.children]
        ),
      ]),
    ]
  );
};

SVGSectionInner.defaultProps = {
  axisComponent: ColumnSummaryAxis,
  zoom: 1,
  inEditMode: false,
  isotopeColumnWidth: 40,
  offsetTop: null,
  marginTop: null,
  innerWidth: 100,
  height: 100, // Section height in meters
  lithologyWidth: 40,
  showWhiteUnderlay: true,
  showFacies: true,
  absolutePosition: true,
  triangleBarRightSide: false,
  marginLeft: -10,
  padding: {
    left: 30,
    top: 10,
    right: 20,
    bottom: 28,
  },
};

const SVGSectionComponent = (props) => {
  const { zoom = 0.1, children } = props;

  const row = sectionData;
  let divisions = sectionSurfaces;

  const { start, clip_end: end } = row;
  // Clip off the top of some columns...
  const height = end - start;
  const range = [start, end];

  return h(
    ColumnProvider,
    {
      divisions,
      height,
      range,
      zoom,
      children,
    },
    h(SVGSectionInner, props)
  );
};
