import { hyperStyled } from "@macrostrat/hyper";
import T from "prop-types";
import {
  ColumnSVG,
  ColumnBox,
  ColumnProvider,
  TriangleBars,
  FaciesIntervals,
  LithologyColumn,
  ParameterIntervals,
} from "@macrostrat/column-components";
import { ColumnTracker } from "../components/link-overlay";
import { FillPatternDefs } from "./pattern-fill";
import { useFaciesColors } from "./util";

import styles from "./main.module.styl";
const h = hyperStyled(styles);

const FaciesTractIntervals = function (props) {
  const colorIndex = useFaciesColors();
  return h(ParameterIntervals, {
    parameter: "facies_tract",
    fillForInterval(facies_tract, d) {
      if (facies_tract == null) {
        return null;
      }
      return colorIndex[facies_tract];
    },
    ...props,
  });
};

const SVGSectionInner = function (props) {
  let {
    id,
    range,
    zoom,
    offsetTop,
    divisions,
    children,
    topSurface,
    bottomSurface,
  } = props;

  divisions = divisions.filter((d) => !d.schematic);

  if (bottomSurface != null) {
    const { bottom: bottomHeight } = divisions.find(
      (d) => d.surface === bottomSurface,
    );
    range[0] = bottomHeight;
  }
  if (topSurface != null) {
    const { bottom: topHeight } = divisions.find(
      (d) => d.surface === topSurface,
    );
    range[1] = topHeight;
  }
  const height = range[1] - range[0];

  //divisions = divisions.filter(d => (range[0] <= d.top) && (d.bottom <= range[1]));

  // Expand SVG past bounds of section

  const faciesTractIndex = {
    exposure: "rework",
    peritidal: "p",
    "marine-siliciclastic": "fc",
    "shoal-shoreface": "sh",
    "shoreface-alluvial-siliciclastic": "cc",
    "marine-carbonate": "mc",
    "peritidal-siliciclastic": "cc",
    "restricted-subtidal": "sub",
    "steepened-outer-ramp": "or",
  };

  const domID = `column-${id}`;

  return h(
    ColumnProvider,
    {
      range,
      height,
      zoom,
      divisions,
    },
    [
      h(
        ColumnBox,
        {
          offsetTop,
          width: 50,
          absolutePosition: false,
        },
        [
          h(
            ColumnTracker,
            {
              className: "section-outer",
              id,
              padding: 5,
            },
            [
              h(
                ColumnSVG,
                {
                  innerWidth: 20,
                  padding: 5,
                  paddingLeft: 25,
                },
                [
                  h(FillPatternDefs, { prefix: domID }),
                  h(LithologyColumn, { width: 20 }, [
                    h(ParameterIntervals, {
                      parameter: "facies_tract",
                      fillForInterval(facies_tract, d) {
                        if (facies_tract == null) {
                          return null;
                        }
                        const id = faciesTractIndex[facies_tract];
                        if (id != null) {
                          return `url(#${domID}-${id})`;
                        }
                        return "black";
                      },
                      ...props,
                    }),
                    h(FaciesIntervals),
                    //h(CarbonateDivisions, {minimumHeight: 2})
                  ]),
                  h(TriangleBars, {
                    minOrder: 1,
                    maxOrder: 1,
                    offsetLeft: -18,
                    lineWidth: 15,
                  }),
                ],
              ),
              children,
            ],
          ),
        ],
      ),
    ],
  );
};

SVGSectionInner.defaultProps = {
  offsetTop: null,
  marginTop: null,
  topSurface: null,
  bottomSurface: null,
};

SVGSectionInner.propTypes = {
  range: T.arrayOf(T.number).isRequired,
  absolutePosition: T.bool,
  offsetTop: T.number,
};

const FaciesSection = function (props) {
  const { id, divisions } = props;

  return h("div.section-column", { className: id }, [
    h(SVGSectionInner, { divisions, ...props }),
  ]);
};

export { FaciesSection };
