import h from "@macrostrat/hyper";
import { AxisBottom } from "@vx/axis";
import chroma from "chroma-js";
import classNames from "classnames";
import { format } from "d3-format";
import { schemeCategory10 } from "d3-scale-chromatic";
import { Component, useContext } from "react";

import { sectionSurfaceProps } from "../../components/link-overlay";
import { sectionIsotopeScheme } from "../display-parameters";
import {
  IsotopeDataLine,
  IsotopeDataPoint,
  IsotopesDataArea,
  useDataLocator,
} from "./data-area";
import { useIsotopes } from "./data-manager";

import {
  ColumnLayoutContext,
  ColumnSVG,
  CrossAxisLayoutProvider,
  useSettings,
} from "@macrostrat/column-components";
import T from "prop-types";

const fmt = format(".1f");

const IsotopeText = function ({ datum, text, ...rest }) {
  const { pointLocator } = useDataLocator();
  const [x, y] = pointLocator(datum);
  return h(
    "text",
    {
      x,
      y,
      ...rest,
    },
    text
  );
};

IsotopeText.propTypes = {
  datum: T.object.isRequired,
};

const ScaleLine = function (props) {
  let { value, className, labelBottom, labelOffset, ...rest } = props;
  if (labelBottom == null) {
    labelBottom = false;
  }
  if (labelOffset == null) {
    labelOffset = 12;
  }
  const { xScale, pixelHeight } = useContext(ColumnLayoutContext);
  const x = xScale(value);
  const transform = `translate(${x})`;
  className = classNames(className, { zero: value === 0 });
  return h("g.tick", { transform, className, key: value }, [
    h("line", { x0: 0, x1: 0, y0: 0, y1: pixelHeight, ...rest }),
    h.if(labelBottom)("text", { y: pixelHeight + labelOffset }, `${value}`),
  ]);
};

ScaleLine.propTypes = {
  value: T.number.isRequired,
  labelBottom: T.bool,
};

class IsotopesColumnInner extends Component {
  constructor(...args) {
    super(...args);
    this.renderAxisLines = this.renderAxisLines.bind(this);
    this.renderData = this.renderData.bind(this);
  }

  static initClass() {
    this.contextType = ColumnLayoutContext;
    this.defaultProps = {
      visible: false,
      corrected: false,
      label: "δ¹³C",
      system: "delta13c",
      trackVisibility: true,
      offsetTop: null,
      showLines: false,
      surfaces: null,
      xRatio: 6,
      height: 100, // Section height in meters
      pixelsPerMeter: 2,
      pixelOffset: 0, // This should be changed
      domain: [-15, 8],
      colorScheme: sectionIsotopeScheme,
      keySection: "J",
      padding: {
        left: 10,
        top: 10,
        right: 10,
        bottom: 60,
      },
    };
    this.propTypes = {
      isotopes: T.object.isRequired,
    };
  }
  render() {
    const { padding, label, system, tickValues } = this.props;
    const { width: innerWidth } = this.context;
    const { left, top, right, bottom } = padding;

    return h("div.isotopes-column", [
      h("div.section-header.subtle", [h("h2", "")]),
      h("div.section-outer", [
        h(
          ColumnSVG,
          {
            innerWidth,
            paddingTop: padding.top,
            paddingLeft: padding.left,
            paddingRight: padding.right,
            paddingBottom: padding.bottom,
          },
          [
            this.renderAxisLines(),
            h(MinimalColumnScale, { system, tickValues }),
            this.renderData(),
          ]
        ),
      ]),
    ]);
  }

  renderAxisLines() {
    const { keySection } = this.props;
    const getHeight = function (d) {
      const { height } = d.section_height.find((v) => v.section === keySection);
      return height;
    };

    let { surfaces } = this.props;
    const { scale } = this.context;
    if (surfaces == null) {
      return null;
    }
    console.log(surfaces);
    surfaces = surfaces.filter((d) => d.type === "sequence-strat");
    return h(
      "g.surfaces",
      { style: { strokeOpacity: 0.3 } },
      surfaces.map((d) => {
        let height;
        try {
          height = getHeight(d);
        } catch (error) {
          // No height for section J. We should create a more
          // robust solution to this problem in the SQL code.
          return null;
        }

        const y = scale(height);
        return h("line", {
          x1: -500,
          x2: 500,
          transform: `translate(0, ${y})`,
          ...sectionSurfaceProps(d),
        });
      })
    );
  }

  renderData() {
    const { system, corrected, isotopes } = this.props;
    if (isotopes == null) {
      return null;
    }

    const allIsotopes = Array.from(isotopes).filter(([k, v]) => {
      return !["K", "W1", "L"].includes(k);
    });
    return h(
      IsotopesDataArea,
      {
        system,
        corrected,
        clipY: true,
      },
      allIsotopes.map(([key, values], i) => {
        let stroke;
        const topDatum = values[values.length - 1];
        //[x,y] = @locatePoint values[values.length-1]
        const fill = (stroke = this.props.colorScheme(key, i));

        return h("g.section-data", { key }, [
          h(
            "g.data-points",
            values.map((d) => {
              let actualStroke = stroke;
              if (!d.in_zebra_nappe) {
                actualStroke = chroma(stroke).brighten(2).desaturate(2).css();
              }

              return h(IsotopeDataPoint, {
                datum: d,
                stroke: actualStroke,
                strokeWidth: 4,
              });
            })
          ),
          h.if(this.props.showLines)(IsotopeDataLine, {
            values: values.filter((d) => d.in_zebra_nappe),
            stroke: chroma(stroke).alpha(0.1).css(),
            strokeWidth: 3,
          }),
          h(IsotopeText, {
            datum: topDatum,
            transform: "translate(10,5)",
            fill,
            text: key,
          }),
        ]);
      })
    );
  }
}
IsotopesColumnInner.initClass();

const partialScale = (scale, domain) =>
  scale.copy().domain(domain).range(domain.map(scale));

const MinimalColumnScale = function (props) {
  const { system, ...rest } = props;
  const { xScale, pixelHeight, width } = useContext(ColumnLayoutContext);
  const label = system === "delta13c" ? "δ¹³C" : "δ¹⁸O";

  let { tickValues } = rest;
  if (tickValues == null) {
    tickValues = xScale.ticks();
  }

  return h("g.scale.isotope-scale-axis", [
    h(
      "g.scale-lines",
      tickValues.map((value) => {
        const strokeDasharray = value == 0 ? null : "2 4";
        return h(ScaleLine, {
          value,
          stroke: "#aaa",
          strokeDasharray,
          strokeWidth: 3,
        });
      })
    ),
    h("rect.underlay", {
      x: 0,
      y: pixelHeight,
      width,
      height: 30,
    }),
    h(AxisBottom, {
      scale: xScale,
      rangePadding: -4,
      tickLength: 3,
      ...rest,
      top: pixelHeight,
      tickLabelProps(tickValue, i) {
        // Compensate for negative sign
        let dx;
        if (tickValue < 0) {
          dx = -2;
        }
        return {
          dy: "-1px",
          dx,
          fontSize: 10,
          textAnchor: "middle",
          fill: "#000",
        };
      },
      labelOffset: 0,
      label,
      labelProps: {
        style: {
          fontFamily: "Merriweather",
          fill: "#000",
        },
        fontSize: 20,
      },
    }),
  ]);
};

class MinimalIsotopesColumnInner extends Component {
  static initClass() {
    this.contextType = ColumnLayoutContext;
    this.defaultProps = {
      visible: false,
      label: "δ¹³C",
      system: "delta13c",
      offsetTop: null,
      colorScheme: schemeCategory10,
      correctIsotopeRatios: false,
      padding: {
        left: 10,
        top: 10,
        right: 10,
        bottom: 30,
      },
    };

    this.propTypes = {
      section: T.string.isRequired,
      isotopes: T.arrayOf(T.object).isRequired,
    };
  }

  render() {
    let corrected,
      correctIsotopeRatios,
      isotopes,
      label,
      padding,
      system,
      transform;
    ({
      padding,
      label,
      transform,
      system,
      corrected,
      label,
      correctIsotopeRatios,
      isotopes,
    } = this.props);
    const { width: innerWidth, xScale } = this.context;
    const { left, top, right, bottom } = padding;

    const stroke = system === "delta13c" ? "dodgerblue" : "red";

    return h("g.isotopes-column", { transform }, [
      h(MinimalColumnScale, { system, tickValues: [-10, -5, 0] }),
      h(
        IsotopesDataArea,
        {
          system,
          correctIsotopeRatios,
          getHeight(d) {
            return d.orig_height;
          },
        },
        [
          h(
            "g.data-points",
            isotopes.map((d) => {
              return h(IsotopeDataPoint, {
                datum: d,
                stroke,
                strokeWidth: 4,
              });
            })
          ),
          h.if(this.props.showLines)(IsotopeDataLine, {
            values: isotopes,
            stroke,
          }),
        ]
      ),
    ]);
  }
}
MinimalIsotopesColumnInner.initClass();

const IsotopesColumn = function (props) {
  const { width, domain, preprocessData, ...rest } = props;
  let isotopes = useIsotopes();
  return h(
    CrossAxisLayoutProvider,
    { width, domain },
    h(IsotopesColumnInner, { isotopes, ...rest })
  );
};

IsotopesColumn.propTypes = {
  width: T.number.isRequired,
  domain: T.arrayOf(T.number).isRequired,
};

IsotopesColumn.defaultProps = {
  domain: [-14, 6],
  width: 120,
  nTicks: 6,
};

const MinimalIsotopesColumn = function (props) {
  const { width, domain, section, ...rest } = props;
  const { correctIsotopeRatios } = useSettings();
  const isotopes = useIsotopes();
  if (isotopes == null) {
    return null;
  }
  const vals = isotopes.get(section);
  if (vals == null) {
    return null;
  }
  return h(
    CrossAxisLayoutProvider,
    { width, domain },
    h(MinimalIsotopesColumnInner, {
      correctIsotopeRatios,
      isotopes: vals,
      section,
      ...rest,
    })
  );
};

MinimalIsotopesColumn.defaultProps = IsotopesColumn.defaultProps;

export { IsotopesColumn, MinimalIsotopesColumn };
