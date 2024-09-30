import { format } from "d3-format";
import { useState, useContext } from "react";
import h from "@macrostrat/hyper";
import {
  ColumnDivision,
  ColumnDivisionsContext,
  useColumnDivisions
} from "../column/data-source";
import { PlatformContext } from "~/platform";
import { ColumnImages } from "./images";
import {
  GrainsizeAxis,
  FloodingSurface,
  TriangleBars,
  ColumnSVG,
  ColumnAxis,
  ColumnProvider,
  ColumnScroller,
  GrainsizeLayoutProvider,
  useSettings,
  LithologyColumn,
  GeneralizedSectionColumn,
  CoveredOverlay,
  FaciesColumnInner,
  LithologyColumnInner,
  DivisionEditOverlay
} from "@macrostrat/column-components";
import { ResultMask, useQueryRunner } from "naukluft-data-backend";
import Samples from "./samples";
import { ManagedSymbolColumn } from "../components";
import { ModalEditor, Direction } from "../editor";
import { Intent, IToastProps } from "@blueprintjs/core";
import { Notification } from "../../notify";
import { SequenceStratContext } from "../sequence-strat-context";
import { ManagedNotesColumn } from "./notes";
import { FaciesTractIntervals } from "../column/facies-tracts";

const fmt = format(".1f");

type NotifyOpts = Omit<IToastProps, "message">;

const sectionNotify = (
  section_id: number,
  height: number,
  opts: NotifyOpts = {}
) => {
  const message = `Section ${section_id} — ${fmt(height)} m`;
  Notification.show({ message, ...opts });
};

const notifyScroll = section_id => height => {
  if (height == null || isNaN(height)) return;
  sectionNotify(section_id, height, { intent: Intent.PRIMARY });
};

type EditingInterval = {
  id: number | null;
  height?: number | null;
};

const nullDivision: EditingInterval = { id: null, height: null };

type EditArgs = { division?: ColumnDivision; height?: number };

interface SectionProps {
  id: string;
  zoom: number;
  scrollToHeight?: number;
  range: [number, number];
  height: number;
  padding?: Padding;
  imageFiles: object[];
  logWidth: number;
  lithologyWidth: number;
  innerWidth: number;
}

type SectionInnerProps = SectionProps & {
  editingInterval?: ColumnDivision;
  editingHeight?: number;
  onEditInterval(a: EditArgs): void;
};

const SectionInner = (props: SectionInnerProps) => {
  const {
    lithologyWidth,
    zoom,
    id,
    height,
    padding,
    editingInterval,
    editingHeight,
    scrollToHeight,
    onEditInterval,
    range
  } = props;

  const divisions = useColumnDivisions(id);
  const {
    activeDisplayMode,
    showFacies,
    showFaciesTracts,
    showCarbonIsotopes,
    showSymbols,
    showNotes
  } = useSettings();

  const {
    showTriangleBars,
    showFloodingSurfaces,
    sequenceStratOrder
  } = useContext(SequenceStratContext);

  const { inEditMode } = useContext(PlatformContext);

  console.log(padding);

  // Set text of header for appropriate zoom level
  let txt = zoom > 0.5 ? "Section " : "";
  txt += id;

  const ticks = height / 10;

  let paddingLeft = props.padding.left + 40;

  const nOrders = sequenceStratOrder[1] - sequenceStratOrder[0] + 1;

  const shouldRenderGeneralized = activeDisplayMode === "generalized";
  const shouldShowImages = zoom >= 0.25 && !shouldRenderGeneralized;

  let lithologyLeftMargin = 0;
  if (showFaciesTracts) lithologyLeftMargin += lithologyWidth;
  if (showTriangleBars) paddingLeft += 25 * nOrders;

  const columnLeftMargin = lithologyLeftMargin + lithologyWidth;

  const grainsizeWidth = 168 * zoom;
  const grainsizeScaleStart = 88 * zoom;

  const grainsizeRange = [grainsizeScaleStart, grainsizeWidth];

  return h("div.section-pane", [
    h("div.section-container", [
      h("div.section-header", null, h("h2", txt)),
      h(
        ColumnProvider,
        {
          zoom,
          range,
          divisions
        },
        [
          h("div.section", [
            h("div.section-outer", [
              h(ColumnScroller, {
                scrollToHeight,
                paddingTop: props.padding.top,
                onScrolled: notifyScroll(id),
                scrollContainer() {
                  return document.querySelector(".section-pane");
                }
              }),
              h(
                GrainsizeLayoutProvider,
                {
                  width: grainsizeWidth + columnLeftMargin,
                  grainsizeScaleStart: grainsizeScaleStart + columnLeftMargin
                },
                [
                  h(DivisionEditOverlay, {
                    onClick: onEditInterval,
                    editingInterval,
                    selectedHeight: editingHeight,
                    top: padding.top,
                    left: paddingLeft,
                    allowEditing: inEditMode
                  }),
                  h(
                    ColumnSVG,
                    {
                      innerWidth: props.innerWidth + props.logWidth,
                      paddingLeft,
                      paddingTop: props.padding.top,
                      paddingBottom: props.padding.bottom,
                      paddingRight: props.padding.right
                    },
                    [
                      h(ColumnAxis, { ticks }),
                      h.if(showFaciesTracts)(
                        LithologyColumn,
                        { width: lithologyWidth },
                        [h(FaciesTractIntervals)]
                      ),
                      h(
                        "g",
                        { transform: `translate(${lithologyLeftMargin})` },
                        [
                          h(LithologyColumn, { width: lithologyWidth }, [
                            h.if(showFacies)(FaciesColumnInner),
                            h(CoveredOverlay),
                            h(LithologyColumnInner)
                          ])
                        ]
                      ),
                      h("g", { transform: `translate(${columnLeftMargin})` }, [
                        h(
                          GrainsizeLayoutProvider,
                          {
                            width: grainsizeWidth,
                            grainsizeScaleStart
                          },
                          [
                            h(GrainsizeAxis),
                            h.if(shouldRenderGeneralized)(
                              GeneralizedSectionColumn,
                              {
                                range: grainsizeRange
                              },
                              h(LithologyColumnInner, {
                                width: grainsizeRange[1]
                              })
                            ),
                            h.if(showCarbonIsotopes)(Samples, {
                              section_id: id
                            }),
                            h.if(showFloodingSurfaces)(FloodingSurface),
                            h.if(showTriangleBars)(TriangleBars, {
                              offsetLeft: -40 - 25 * nOrders,
                              lineWidth: 25,
                              minOrder: sequenceStratOrder[0],
                              maxOrder: sequenceStratOrder[1]
                            }),
                            h.if(showSymbols)(ManagedSymbolColumn, {
                              id,
                              left: 215
                            }),
                            h.if(showNotes)(ManagedNotesColumn, {
                              visible: true,
                              id,
                              width: props.logWidth,
                              editable: inEditMode,
                              transform: `translate(${props.innerWidth})`
                            })
                          ]
                        )
                      ])
                    ]
                  )
                ]
              ),
              h.if(shouldShowImages)(ColumnImages, {
                paddingTop: props.padding.top,
                paddingRight: props.padding.right,
                paddingBottom: props.padding.bottom,
                paddingLeft: paddingLeft + lithologyWidth,
                sectionID: id
              })
            ])
          ])
        ]
      )
    ])
  ]);
};

SectionInner.defaultProps = {
  zoom: 1
};

const SectionComponent = (props: SectionProps) => {
  const { inEditMode: isEditable } = useContext(PlatformContext);
  const { updateDivisions } = useContext(ColumnDivisionsContext);
  const dispatch = useQueryRunner();

  const { id: section_id } = props;
  const divisions = useColumnDivisions(section_id);

  const [editingInterval, setEditingInterval] = useState<EditingInterval>(
    nullDivision
  );

  /* EDITING FUNCTIONS */
  function editInterval({ division, height }: EditArgs) {
    if (!isEditable && division != null) {
      return sectionNotify(section_id, height);
    }
    const { id } = division;
    setEditingInterval({ id, height });
  }

  async function addInterval(height: number) {
    const { id: newID } = await dispatch(
      "section/add-interval",
      { section: section_id, height },
      ResultMask.one
    );
    const { id: oldID, height: newHeight } = editingInterval;
    let interval: EditingInterval = nullDivision;

    // If we are editing the old interval, keep editing
    if (oldID != null) interval = { id: newID, height: newHeight };
    await updateDivisions();
    setEditingInterval(interval);
  }

  async function removeInterval(id: number) {
    await dispatch(
      "section/remove-interval",
      { section: section_id, id },
      ResultMask.none
    );
    await updateDivisions();
    setEditingInterval(nullDivision);
  }

  function moveCursor(direction: Direction) {
    let ix = divisions.findIndex(d => d.id == editingInterval.id);
    switch (direction) {
      case Direction.Down: {
        if (ix > 0) ix -= 1;
        break;
      }
      case Direction.Up: {
        if (ix < divisions.length - 1) ix += 1;
        break;
      }
    }
    const { id: newID } = divisions[ix];
    setEditingInterval({ id: newID, height: null });
  }

  function closeDialog() {
    setEditingInterval(nullDivision);
  }

  const interval = divisions.find(d => d.id === editingInterval.id);

  return h([
    h(SectionInner, {
      editingInterval: interval,
      editingHeight: editingInterval.height,
      onEditInterval: editInterval,
      ...props
    }),
    h(ModalEditor, {
      isOpen: interval != null,
      interval,
      height: editingInterval.height,
      section: section_id,
      moveCursor,
      showDetails: true,
      closeDialog() {
        setEditingInterval(nullDivision);
      },
      addInterval,
      removeInterval
    })
  ]);
};

SectionComponent.defaultProps = {
  zoom: 1,
  offset: 0,
  offsetTop: null,
  useRelativePositioning: true,
  visible: true,
  trackVisibility: true,
  innerWidth: 250,
  offsetTop: null,
  scrollToHeight: null,
  lithologyWidth: 40,
  logWidth: 450,
  containerWidth: 1000,
  padding: {
    left: 30,
    top: 30,
    right: 30,
    bottom: 30
  }
};

export { SectionComponent };
