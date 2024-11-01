import T from "prop-types";
import { useContext } from "react";
import { useHistory } from "react-router-dom";
import { EditorContext } from "./editor";

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
import { useSequenceStratSettings } from "../sequence-strat-context";
import { SummaryColumnProvider } from "./data-provider";
import { ColumnTracker } from "../components/link-overlay";
import { PlatformContext } from "../../platform";
import { MinimalIsotopesColumn } from "./chemostrat";
import { FaciesTractIntervals } from "../column/facies-tracts";

import { hyperStyled } from "@macrostrat/hyper";
import styles from "./main.module.styl";
const h = hyperStyled(styles);

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

const ColumnIsotopes = function (props) {
  const opts = useSettings();
  let { id, columnWidth } = props;
  if (columnWidth == null) {
    columnWidth = 40;
  }
  if (!opts.isotopesPerSection) {
    return null;
  }
  return h([
    h.if(opts.showCarbonIsotopes)(MinimalIsotopesColumn, {
      width: columnWidth,
      section: id,
      transform: "translate(120)",
    }),
    h.if(opts.showOxygenIsotopes)(MinimalIsotopesColumn, {
      width: columnWidth,
      section: id,
      transform: "translate(160)",
      system: "delta18o",
    }),
  ]);
};

const ColumnUnderlay = function (props) {
  let { width, paddingLeft } = props;
  const { pixelHeight } = useContext(ColumnContext);
  if (paddingLeft == null) {
    paddingLeft = 5;
  }
  return h("rect.underlay", {
    width,
    height: pixelHeight + 10,
    x: -paddingLeft,
    y: -5,
    fill: "var(--background-color)",
  });
};

const SVGSectionInner = function (props) {
  let {
    id,
    padding,
    innerWidth,
    showWhiteUnderlay,
    offsetTop,
    absolutePosition,
  } = props;

  const { inEditMode } = useContext(PlatformContext);

  const { sequenceStratOrder, showFloodingSurfaces, showTriangleBars } =
    useSequenceStratSettings();

  const { showCarbonIsotopes, showOxygenIsotopes, isotopesPerSection } =
    useSettings();

  let overallWidth = 120;
  overallWidth += 42; // Symbol column

  let chemostratWidth = 0;
  if (isotopesPerSection) {
    if (showCarbonIsotopes) {
      chemostratWidth += 40;
    }
    if (showOxygenIsotopes) {
      chemostratWidth += 40;
    }
  }
  overallWidth += chemostratWidth;

  let triangleBarTranslate = 0;
  let mainTranslate = 0;

  let underlayPaddingLeft: number = padding.left;
  let underlayWidth = 300;

  let triangleBars: any = null;

  if (showTriangleBars && sequenceStratOrder != null) {
    // How many bars are we rendering

    const nOrders = sequenceStratOrder[1] - sequenceStratOrder[0] + 1;

    //40
    const triangleBarWidth = 20 * nOrders;

    overallWidth += triangleBarWidth;
    if (props.triangleBarRightSide) {
      triangleBarTranslate = 120 + triangleBarWidth + chemostratWidth;
      underlayPaddingLeft = 0;
      underlayWidth = 146 + chemostratWidth;
      overallWidth += 6;
    } else {
      triangleBarTranslate = 20 * (nOrders - 2);
      mainTranslate = triangleBarWidth + 8;
      underlayPaddingLeft -= 35 + triangleBarTranslate;
    }

    triangleBars = h(TriangleBars, {
      id,
      offsetLeft: 0,
      lineWidth: 20,
      minOrder: sequenceStratOrder[0],
      maxOrder: sequenceStratOrder[1],
    });
  }

  const floodingSurfaceStart = 42;

  // Expand SVG past bounds of section

  // We need to change this!

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
              h(EditOverlay, {
                id,
                allowEditing: inEditMode,
                left: padding.left + mainTranslate,
                top: padding.top,
              }),
              h(
                ColumnSVG,
                {
                  width: overallWidth,
                  paddingTop: padding.top,
                  paddingBottom: padding.bottom,
                  paddingLeft: padding.left,
                },
                [
                  h.if(showWhiteUnderlay)(ColumnUnderlay, {
                    width: underlayWidth,
                    paddingLeft: underlayPaddingLeft,
                  }),
                  h("g.main", { transform: `translate(${mainTranslate})` }, [
                    h.if(showFloodingSurfaces)(FloodingSurface, {
                      offsetLeft: -floodingSurfaceStart,
                      lineWidth: floodingSurfaceStart,
                    }),
                    h(props.axisComponent),
                    h(ColumnMain),
                    h(ManagedSymbolColumn, {
                      left: 90,
                      id,
                    }),
                    h(ColumnIsotopes, {
                      id,
                      columnWidth: props.isotopeColumnWidth,
                    }),
                  ]),
                  h(
                    "g.sequence-strat",
                    { transform: `translate(${triangleBarTranslate})` },
                    triangleBars,
                  ),
                ],
              ),
            ],
          ),
          h(
            "div.section-children",
            {
              style: {
                marginTop: padding.top,
                marginLeft: padding.left + mainTranslate,
              },
            },
            [props.children],
          ),
        ],
      ),
    ],
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

SVGSectionInner.propTypes = {
  //inEditMode: T.bool
  absolutePosition: T.bool,
  isotopesPerSection: T.bool,
  offsetTop: T.number,
};

const SVGSectionComponent = (props) => {
  const { id } = props;
  return h(SummaryColumnProvider, { id }, h(SVGSectionInner, props));
};

export { SVGSectionInner, SVGSectionComponent };
