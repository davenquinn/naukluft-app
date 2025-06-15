import h from "@macrostrat/hyper";

import { useColumnDivisions } from "../column/data-source";
import {
  FloodingSurface,
  ColumnSVG,
  ColumnAxis,
  ColumnProvider,
  GrainsizeLayoutProvider,
  LithologyColumn,
  TriangleBars,
  CoveredOverlay,
  FaciesColumnInner,
  LithologyColumnInner,
  Padding,
  useColumn,
  useColumnLayout,
} from "@macrostrat/column-components";
import { extractPadding } from "@macrostrat/ui-components";
import { useSection } from "~/sections/data-providers";
import { ColumnImages } from "../single-section/images";
import { ManagedSymbolColumn } from "../components";
import { GrainsizeAxis } from "./grainsize-axis";

interface SectionProps {
  sectionID: string;
  zoom: number;
  range?: [number, number];
  logWidth: number;
  lithologyWidth: number;
  innerWidth: number;
}

const ColumnAxisLabel = (props) => {
  const { height, id } = props;
  const { pixelsPerMeter } = useColumn();
  return h(
    "text.axis-label",
    {
      transform: `translate(-24 ${(height * pixelsPerMeter) / 2}) rotate(-90)`,
      textAnchor: "middle",
    },
    [h("tspan.title", `Section ${id}`), " ", h("tspan.unit", `(m)`)],
  );
};

const ColumnTitle = (props) => {
  const { id } = props;
  const { pixelHeight } = useColumnLayout();

  return h("text.section-id", { x: -40, y: pixelHeight + 12 }, `Section ${id}`);
};

const SectionComponent = (props: SectionProps & Padding) => {
  const { sectionID, lithologyWidth, innerWidth, range, zoom } = props;
  const section = useSection(sectionID);
  const divisions = useColumnDivisions(sectionID);
  const { id, imageFiles } = section;

  const leftMatterOffset = 40;
  let padding = extractPadding(props);
  padding.paddingLeft += leftMatterOffset;

  const showFloodingSurfaces = false;

  const height = range[1] - range[0];
  const ticks = height / 5;

  let lithologyLeftMargin = 0;

  const columnLeftMargin = lithologyLeftMargin + lithologyWidth;
  const pixelsPerMeter = 15;

  const grainsizeWidth = (168 / 20) * pixelsPerMeter * zoom;
  const grainsizeScaleStart = (88 / 20) * pixelsPerMeter * zoom;

  return h("div.detail-section", [
    h("div.section-container", [
      //h("h3", [id, " ", h("span.height-range", `${range[0]}–${range[1]} m`)]),
      h(
        ColumnProvider,
        {
          pixelsPerMeter,
          range,
          divisions,
        },
        [
          h("div.section", [
            h("div.section-outer", [
              h(
                GrainsizeLayoutProvider,
                {
                  width: grainsizeWidth + columnLeftMargin,
                  grainsizeScaleStart: grainsizeScaleStart + columnLeftMargin,
                },
                [
                  h(
                    ColumnSVG,
                    {
                      innerWidth,
                      ...padding,
                    },
                    [
                      h(TriangleBars, {
                        offsetLeft: -leftMatterOffset,
                        lineWidth: 15,
                        minOrder: 2,
                        maxOrder: 2,
                      }),
                      h(
                        "g",
                        { transform: `translate(${lithologyLeftMargin})` },
                        [
                          h(LithologyColumn, { width: lithologyWidth }, [
                            h(FaciesColumnInner),
                            h(CoveredOverlay),
                            h(LithologyColumnInner),
                          ]),
                        ],
                      ),
                      h("g", { transform: `translate(${columnLeftMargin})` }, [
                        h(
                          GrainsizeLayoutProvider,
                          {
                            width: grainsizeWidth,
                            grainsizeScaleStart,
                          },
                          [
                            h.if(showFloodingSurfaces)(FloodingSurface, {
                              lineWidth: 20,
                              offsetLeft: -60,
                            }),
                            h(GrainsizeAxis),
                            h(ColumnTitle, { id }),
                            h(ManagedSymbolColumn, { id, left: 110 }),
                          ],
                        ),
                      ]),
                      //h(ColumnAxisLabel, { height, id }),
                      h(ColumnAxis, { ticks }),
                    ],
                  ),
                ],
              ),
              h(ColumnImages, {
                ...padding,
                paddingLeft: padding.paddingLeft + lithologyWidth,
                sectionID,
              }),
            ]),
          ]),
        ],
      ),
    ]),
  ]);
};

SectionComponent.defaultProps = {
  zoom: 1,
  offset: 0,
  offsetTop: null,
  useRelativePositioning: true,
  visible: true,
  trackVisibility: true,
  innerWidth: 260,
  offsetTop: null,
  scrollToHeight: null,
  lithologyWidth: 40,
  logWidth: 450,
  containerWidth: 1000,
  padding: 10,
  paddingBottom: 20,
};

export { SectionComponent };
