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
import T from "prop-types";
import { useContext } from "react";
import { useHistory } from "react-router-dom";
import { EditorContext } from "../summary-sections/editor";
import { SectionDataContext } from "../data-providers";
import { ColumnProvider } from "@macrostrat/column-components";
import { useColumnDivisions } from "../column/data-source";
import styles from "../summary-sections/main.styl";
import "../main.styl";

import {
  GrainsizeLayoutProvider,
  ColumnSVG,
  ColumnBox,
  FloodingSurface,
  TriangleBars,
  LithologyColumn,
  GeneralizedSectionColumn,
  SimplifiedLithologyColumn,
  CoveredOverlay,
  FaciesColumnInner,
  ColumnContext,
  ColumnAxis,
  DivisionEditOverlay,
  useSettings,
} from "@macrostrat/column-components";

import { ManagedSymbolColumn } from "../components";
import { SequenceStratContext } from "../sequence-strat-context";
import { ColumnTracker } from "../components/link-overlay";
import { PlatformContext } from "../../platform";
import { MinimalIsotopesColumn } from "../summary-sections/chemostrat";
import { FaciesTractIntervals } from "../column/facies-tracts";

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
  let {
    sections,
    groupMargin,
    columnMargin,
    columnWidth,
    tightenSpacing,
    scrollable,
  } = props;

  const { showLegend } = useSettings();

  if (sections == null) {
    return null;
  }
  if (!(sections.length > 0)) {
    return null;
  }

  const row = sections.find((d) => d.id === "J");
  let { offset } = row;

  const overflow = scrollable ? "scroll" : "inherit";

  return h("div#section-pane", { style: { overflow } }, [
    h.if(showLegend)(Legend),
    h(SectionContainer, [
      h(LithostratKey, {
        zoom: 0.1,
        key: "key",
        offset,
      }),
      h("div#section-container", [
        h(ArrangedSections, {
          sections,
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

const sectionData = {
  section: "A",
  start: 0,
  end: 175,
  clip_end: 175,
  offset: "0",
  location: "Tsams",
  id: "A",
  range: [0, 175],
  height: 175,
  scaleFactor: 40.69714285714286,
};

function ArrangedSections(props: ArrangedSectionsProps) {
  const { tightenSpacing, groupMargin, location, ...rest } = props;
  const sections = [sectionData];

  console.log("Arranged sections", sections);

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
            triangleBarRightSide: id == "J",
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

const ColumnMain = function () {
  const { showFacies, showFaciesTracts, showLithology, showGrainsize } =
    useSettings();
  let c = GeneralizedSectionColumn;
  let width = null;
  if (!showGrainsize) {
    c = LithologyColumn;
    width = 60;
  }

  return h(c, { width }, [
    h.if(showFacies)(FaciesColumnInner),
    h.if(showFaciesTracts)(FaciesTractIntervals),
    h.if(showLithology)(SimplifiedLithologyColumn),
    h(CoveredOverlay),
  ]);
};

const EditOverlay = function (props) {
  let navigateTo: (arg0: string) => void;
  let { interactive } = useSettings();
  if (interactive == null) {
    interactive = false;
  }
  if (!interactive) {
    return null;
  }
  try {
    navigateTo = useHistory()?.push;
  } catch (error) {
    navigateTo = () => {};
  }

  let { id, ...rest } = props;
  const { onEditInterval, editingInterval: interval } =
    useContext(EditorContext);
  const editingInterval = interval?.section_id == id ? interval : null;

  const onClick = function ({ height, event, division }) {
    const sectionID = division?.original_section ?? division?.section_id ?? id;
    // If we're working with a generalized division, we need to recalculate height
    let _height = height;
    if (division?.original_bottom != null) {
      _height -= division.bottom;
      _height += division.original_bottom;
    }

    if (event.shiftKey && onEditInterval != null) {
      onEditInterval(division);
      return;
    }

    // OR, navigate to a certain height
    let path = `/sections/${sectionID}`;
    if (_height != null) {
      // Sometimes, URLs have a problem with non-rounded heights
      path += `/height/${Math.round(_height)}`;
    }
    navigateTo(path);
  };

  return h(DivisionEditOverlay, {
    showInfoBox: false,
    onClick,
    editingInterval,
    ...rest,
  });
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
    if (props.triangleBarRightSide) {
      triangleBarTranslate = 120 + triangleBarWidth;
      underlayPaddingLeft = 0;
      overallWidth += 6;
    } else {
      triangleBarTranslate = 20 * (nOrders - 2);
      mainTranslate = triangleBarWidth + 8;
      underlayPaddingLeft -= 35 + triangleBarTranslate;
    }
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
      h(
        ColumnTracker,
        {
          className: "section-outer",
          id,
          paddingTop: 10,
        },
        [
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
                    h(ColumnMain),
                    h(ManagedSymbolColumn, {
                      left: 90,
                      id,
                    }),
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
        ]
      ),
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
  const { id } = props;
  return h(SummaryColumnProvider, { id }, h(SVGSectionInner, props));
};

const SummaryColumnProvider = (props) => {
  /*
  Centralized provider for a single column
  identified by ID.
  */
  const {
    id,
    zoom = 0.1,
    children,
    filterDivisions = (d) => !d.schematic,
  } = props;

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
