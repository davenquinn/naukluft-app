import { ColumnContext, SVG, useSettings } from "@macrostrat/column-components";
import { expandInnerSize, extractPadding } from "@macrostrat/ui-components";
import { hyperStyled } from "@macrostrat/hyper";
import classNames from "classnames";
import { pairs } from "d3-array";
import { linkHorizontal } from "d3-shape";
import update from "immutability-helper";
import T from "prop-types";
import {
  Component,
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
} from "react";
import { any, debounce } from "underscore";
import { Notification } from "~/notify";
import { useSurfaces } from "~/sections/providers";
import { prepareLinkData } from "./build-links";
import styles from "./main.module.styl";
import { ColumnSVG, useColumn } from "@macrostrat/column-components";

const h = hyperStyled(styles);

const SectionPositionContext = createContext(null);
const SectionObserverContext = createContext({});

class SectionPositionProvider extends Component {
  constructor(props) {
    super(props);
    this.mounted = false;
    this.setPosition = this.setPosition.bind(this);
    this.accumulateChanges = this.accumulateChanges.bind(this);
    this.update = this.update.bind(this);
    this.container = null;
    this.state = { value: {} };
    this.spec = null;
    this.debouncedUpdate = debounce(this.update, 200);
  }

  setPosition(id, scale, pos, otherProps) {
    let containerPosition;
    const { value } = this.state;
    const el = this.container;
    if (el != null) {
      containerPosition = el.getBoundingClientRect();
    } else {
      containerPosition = { x: 0, y: 0 };
    }

    if (pos == null) {
      return;
    }
    if (scale == null) {
      return;
    }

    let { x, y, width } = pos;
    x -= containerPosition.x;
    y -= containerPosition.y;

    if (value[id] != null) {
      if (x === value[id].x && y === value[id].y && width === value[id].width) {
        return;
      }
    }

    const { width: innerWidth, padding, ...rest } = otherProps;

    const [min, max] = scale.range();
    const innerHeight = Math.abs(max - min);
    const sz = expandInnerSize({ innerWidth, innerHeight, padding, ...rest });

    const globalRange = scale.range().map((d) => d + y + sz.paddingTop);
    const globalScale = scale.copy().range(globalRange).clamp(false);

    const val = { id, x, y, width, scale, globalScale, ...sz };
    return this.accumulateChanges({ [id]: { $set: val } });
  }

  accumulateChanges(spec) {
    const oldSpec = this.spec || {};
    this.spec = { ...oldSpec, ...spec };
    return this.debouncedUpdate();
  }

  update() {
    if (this.spec == null) {
      return;
    }
    // This only works because we have a sningle component
    if (!this.mounted) {
      return;
    }
    const value = update(this.state.value, this.spec);
    this.spec = null;
    return this.setState({ value });
  }

  render() {
    const { children } = this.props;
    const { value } = this.state;

    return h(
      "div.section-positioner",
      {
        ref: (ref) => {
          this.container = ref;
        },
      },
      [
        h(SectionPositionContext.Provider, { value: this.setPosition }, [
          h(SectionObserverContext.Provider, { value }, children),
        ]),
      ],
    );
  }

  componentDidMount() {
    this.mounted = true;
  }
  componentWillUnmount() {
    // This is a horrible hack but it seems to work...
    this.mounted = false;
  }
}

const useSectionPositions = () => useContext(SectionObserverContext);

interface ColumnTrackerProps {
  width?: number;
  id: string;
  adjustPosition?: (d: any) => any;
  className?: string;
  children?: ReactNode;
}

function ColumnTracker(props: ColumnTrackerProps) {
  /*
  Tracks a column's position and reports
  it back to the SectionObserverContext.
  */
  const { children, className, id, adjustPosition, ...rest } = props;
  const setPosition = useContext(SectionPositionContext);
  const { scale } = useContext(ColumnContext);
  const _adjustPosition = adjustPosition ?? ((d) => d);

  const ref = useRef();

  const runPositioner = function () {
    if (ref.current == null) {
      return;
    }
    // Run this code after render
    const rect = ref.current.getBoundingClientRect();
    return setPosition(id, scale, _adjustPosition(rect), rest);
  };

  useEffect(runPositioner);

  return h("div", { className, ref }, children);
}

// https://www.particleincell.com/2012/bezier-splines/

const SectionTrackerRects = function (props) {
  const sectionPositions = useContext(SectionObserverContext);
  const sections = Object.values(sectionPositions);
  return h(
    "g.section-trackers",
    sections.map(function (d) {
      const { x, y, scale, width, height } = d;
      if (scale == null) {
        return null;
      }
      return h("rect.section-tracker", { x, y, width, height, ...props });
    }),
  );
};

const buildLink = linkHorizontal()
  .x((d) => d.x)
  .y((d) => d.y);

const SectionLink = function (props) {
  let inferred, width, className, d;
  let { connectLines, surface, stroke, strokeWidth, onClick } = props;

  //const { startX } = props;
  const startX = null;

  let { section_height, surface_id, unit_commonality, type, note } = surface;

  // CURRENTLY PRIVATE API to allow section gaps to be filled
  // or not when connectLines = false
  const fillSectionWidth = true;
  const __gapCommand = fillSectionWidth ? "l" : "M";

  const sectionIndex = useContext(SectionObserverContext);

  const heights = section_height.map(function (v) {
    const { section, height, inferred, inDomain, certainty } = v;
    const { globalScale, x: x0, width } = sectionIndex[section];
    return {
      x0,
      x1: x0 + width,
      y: globalScale(height),
      inferred,
      inDomain,
      section,
      certainty,
    };
  });

  heights.sort((a, b) => a.x0 - b.x0);

  if (heights.length < 2) {
    return null;
  }

  const pathData = pairs(heights, function (a, b) {
    inferred = a.inferred || b.inferred;
    const certainty = Math.min(a.certainty || 10, b.certainty || 10);
    const source = { x: a.x1, y: a.y, section: a.section };
    const target = { x: b.x0, y: b.y, section: b.section };
    const { inDomain } = b;
    width = b.x1 - b.x0;
    return { source, target, inferred, certainty, width };
  });

  d = null;
  let certainty = 10;
  const links = (() => {
    const result = [];
    for (let i = 0; i < pathData.length; i++) {
      const pair = pathData[i];
      if (unit_commonality == null) {
        unit_commonality = 0;
      }
      const { width } = pair;
      ({ certainty, inferred } = pair);
      // First move to initial height
      const { x, y } = pair.source;

      if (connectLines == null) {
        d = null;
      }

      if (d == null) {
        let initialX = startX != null ? startX : x;
        if (connectLines) {
          initialX -= width;
        } else if (fillSectionWidth) {
          initialX -= width / 2;
        }
        d = `M${initialX},${y}`;
      }

      let linkLine = buildLink(pair);
      if (connectLines || fillSectionWidth) {
        linkLine = "L" + linkLine.substring(1);
        linkLine += `l${width},0`;
      } else {
        linkLine += `${__gapCommand}${width},0`;
      }
      d += linkLine;

      result.push(
        h(__LinkPath, {
          d,
          surface,
          certainty,
          stroke,
          strokeWidth,
          type,
          onClick,
          inferred,
        }),
      );
    }
    return result;
  })();

  if (connectLines) {
    return h(__LinkPath, {
      d,
      certainty,
      surface,
      strokeWidth,
      stroke,
      onClick,
      type,
      inferred,
    });
  } else {
    return h("g", links);
  }
};

function __LinkPath({
  stroke = "black",
  strokeWidth = 1,
  surface,
  d,
  onClick,
  certainty,
  inferred,
  className,
  type,
}: {
  stroke?: string;
  strokeWidth?: number;
  d: string;
  onClick?: () => void;
  certainty: number;
  inferred: boolean;
  className?: string;
  type?: string;
  surface: any;
}) {
  // sequence strat
  const { surface_type, surface_order } = surface;

  let order_class = null;
  if (surface_order != null) {
    order_class = `order-${surface_order}`;
  }

  // lithostrat
  const { unit_commonality } = surface;
  if (unit_commonality != null) {
    order_class = `commonality-${unit_commonality}`;
  }

  return h(SectionLinkPath, {
    className: classNames(
      "section-link",
      type,
      className,
      { inferred },
      certaintyClassName(certainty),
      order_class,
      surface_type == "mfs" ? "maximum-flooding-surface" : null,
      surface_type == "sb" ? "sequence-boundary" : null,
    ),
    stroke,
    strokeWidth,
    onClick,
    d,
    certainty,
  });
}

function certaintyClassName(certainty: number | null) {
  if (certainty == null) {
    return `unknown-certainty`;
  } else if (certainty == 10) {
    return `certain`;
  } else if (certainty >= 7) {
    return `high-certainty`;
  } else if (certainty >= 4) {
    return `medium-certainty`;
  } else {
    return `low-certainty`;
  }
}

const sectionSurfaceProps = function (surface) {
  let stroke: string;
  const { surface_type, surface_order } = surface;

  return { stroke: "black", strokeWidth: 2, opacity: 0.5 };
};

function SectionLinkPath(props) {
  let { onClick, certainty, style, ...rest } = props;

  return h("path", {
    onClick,
    fill: "none",
    style: {
      cursor: onClick ? "pointer" : null,
      ...style,
    },
    ...rest,
  });
}

SectionLink.propTypes = {
  connectLines: T.bool,
  stroke: T.string,
  strokeWidth: T.number,
  surface: T.object.isRequired,
};

const FilteredSectionLink = function (props) {
  let stroke, strokeWidth;
  const { type, note, surface_id } = props.surface;
  const { showLithostratigraphy, showSequenceStratigraphy } = useSettings();
  if (type === "lithostrat") {
    stroke = "#ccc";
    strokeWidth = 1;
    if (!showLithostratigraphy) {
      return null;
    }
  }
  if (type === "sequence-strat") {
    ({ stroke, strokeWidth } = sectionSurfaceProps(props.surface));
    if (!showSequenceStratigraphy) {
      return null;
    }
  }

  const onClick = function () {
    console.log("click", type, surface_id);
    const v =
      type === "lithostrat" ? "Lithostratigraphic" : "Sequence-stratigraphic";
    return Notification.show({
      message: h("div", [
        `${v} surface `,
        h("code", surface_id),
        h.if(note != null)([`: ${note}`]),
      ]),
    });
  };

  return h(SectionLink, { ...props, stroke, strokeWidth, onClick });
};

const getSize = function (sectionIndex, padding = {}) {
  let w_ = 0;
  let h_ = 0;
  for (let k in sectionIndex) {
    const v = sectionIndex[k];
    const { width, height, x, y } = v;
    const maxX = x + width;
    const maxY = y + height;
    if (maxX > w_) {
      w_ = maxX;
    }
    if (maxY > h_) {
      h_ = maxY;
    }
  }
  return expandInnerSize({
    innerWidth: w_,
    innerHeight: h_,
    ...padding,
  });
};

const useCanvasSize = function () {
  const sectionIndex = useContext(SectionObserverContext);
  return getSize(sectionIndex);
};

const SectionLinks = function (props) {
  const { surfaces, connectLines, startX, innerRef } = props;
  if (!surfaces.length) {
    return null;
  }
  const sectionIndex = useContext(SectionObserverContext);

  const surfacesNew = prepareLinkData({
    ...props,
    sectionIndex,
  });

  return h(
    "g.section-links",
    surfacesNew.map((surface) =>
      h(FilteredSectionLink, { surface, connectLines, startX }),
    ),
  );
};

export function ColumnSurfaces({
  type = "sequence-strat",
  keySection,
  className,
  padding,
}: {
  type: string;
  keySection?: string;
}) {
  const surfaces = useSurfaces();
  const { scale } = useColumn();

  const filteredSurfaces = filterSectionSurfaces(surfaces, keySection, type);

  return h(
    ColumnSVG,
    {
      width: 300,
      className: classNames(className, "section-link-overlay"),
      padding,
    },

    [
      h(
        "g.surfaces",
        filteredSurfaces.map((data) => {
          const { height, certainty, surface, inferred } = data;

          const y1 = scale(height);

          const d = `M0,${y1} L300,${y1}`;

          return h(__LinkPath, { surface, inferred, d, certainty });
        }),
      ),
    ],
  );
}

function filterSectionSurfaces(
  surfaces: any[],
  section: string,
  type: string = "sequence-strat",
): SectionSurfaceInfo[] {
  const newSurfaces: SectionSurfaceInfo[] = [];
  for (const surface of surfaces) {
    if (surface.type !== type) {
      continue;
    }
    const sectionData = surface.section_height.find(
      (d) => d.section === section,
    );

    const inferred = any(surface.section_height, (d) => d.inferred === true);
    const certainty = Math.min(
      ...surface.section_height.map((d) => d.certainty || 10),
    );

    if (sectionData == null) {
      continue;
    }
    const { height } = sectionData;
    newSurfaces.push({
      surface,
      height,
      section,
      inferred,
      certainty,
    });
  }
  return newSurfaces;
}

interface SectionSurfaceInfo {
  surface: any;
  height: number;
  section: string;
  inferred?: boolean;
  certainty?: number;
}

function CompositeLegendLine(props) {
  // A composite line made up of multiple segments that shows multiple levels of certainty
  const { width, classes, ...rest } = props;
  const eachWidth = width / classes.length;
  return h(
    "g.composite-legend-line",
    rest,
    classes.map((cls, index) => {
      return h("line", {
        className: cls,
        x1: index * eachWidth,
        y1: 0,
        x2: (index + 1) * eachWidth,
        y2: 0,
      });
    }),
  );
}

export function SectionLinkLegendLine(props) {
  const classes = [
    "certain",
    "high-certainty",
    //"medium-certainty",
    "low-certainty",
  ].map((d) => styles[d] + " " + styles["section-link"]);
  return h(CompositeLegendLine, {
    ...props,
    className: classNames(props.className, "section-links"),
    classes,
  });
}

export function useSectionOrder(): string[] | null {
  // Get an ordered list of section IDs from the SectionObserverContext
  const sectionIndex = useContext(SectionObserverContext);
  if (sectionIndex.length === 0) {
    return null;
  }
  const sections = Object.values(sectionIndex);
  // First sort by x position, then y
  sections.sort((a, b) => {
    if (a.x !== b.x) {
      return a.x - b.x;
    }
    return a.y - b.y;
  });
  return sections.map((d) => d.id);
}

function SectionLinkOverlay(props) {
  let {
    showSectionTrackers = false,
    connectLines = true,
    innerRef,
    className,
    surfaces,
    extendLinks = false,
    ...rest
  } = props;
  const padding = extractPadding(rest);

  // Get surfaces from context if unset
  if (surfaces == null) surfaces = useSurfaces();
  if (surfaces == null) {
    return null;
  }
  if (!surfaces.length) {
    return null;
  }

  const sectionIndex = useContext(SectionObserverContext);
  const sz = getSize(sectionIndex, padding);

  let startX = null;
  if (extendLinks) {
    startX = padding.paddingLeft;
  }

  return h(
    SVG,
    {
      // Shouldn't need ID but we apparently do
      className: classNames("section-link-overlay", className),
      innerRef,
      ...sz,
      ...rest,
    },
    [
      h.if(showSectionTrackers)(SectionTrackerRects),
      h(SectionLinks, { connectLines, surfaces, startX }),
    ],
  );
}

export {
  ColumnTracker,
  SectionLinkOverlay,
  SectionLinks,
  SectionPositionContext,
  SectionPositionProvider,
  prepareLinkData,
  sectionSurfaceProps,
  useCanvasSize,
  useSectionPositions,
};
