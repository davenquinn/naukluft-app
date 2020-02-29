import {format} from "d3-format";
import {useState, useContext} from "react";
import h from "@macrostrat/hyper";

import {
  ColumnDivision,
  ColumnDivisionsContext,
  useColumnDivisions
} from '../column/data-source'
import {PlatformContext} from '~/platform'
import {Intent} from "@blueprintjs/core";
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

import {ColumnImages} from "../single-section/images";
import Samples from "../single-section/samples";
import {ManagedNotesColumn} from "../single-section/notes";
import {ManagedSymbolColumn} from "../components";
import {ModalEditor, Direction} from "../editor";
import {IToastProps} from '@blueprintjs/core'
import {Notification} from "../../notify";
import {SequenceStratContext} from "../sequence-strat-context";

import {FaciesTractIntervals} from '../column/facies-tracts';

import {db, storedProcedure} from "~/sections/db";
import addIntervalQuery from '../sql/add-interval.sql';
import removeIntervalQuery from '../sql/remove-interval.sql';

const fmt = format(".1f");

type NotifyOpts = Omit<IToastProps,'message'>

const sectionNotify = (section_id: number, height: number, opts: NotifyOpts = {})=>{
  const message = `Section ${section_id} — ${fmt(height)} m`
  Notification.show({message, ...opts});
}

const notifyScroll = (section_id)=>(height)=> {
  if (height == null || isNaN(height)) return
  sectionNotify(section_id, height, {intent: Intent.PRIMARY})
}

type EditingInterval = {
  id: number|null,
  height?: number|null
}

const nullDivision: EditingInterval = {id: null, height: null};

type EditArgs = {division?: ColumnDivision, height?: number}

interface SectionProps {
  id: string,
  zoom: number,
  scrollToHeight?: number,
  range: [number, number],
  height: number,
  padding?: Padding,
  imageFiles: object[],
  logWidth: number,
  lithologyWidth: number,
  innerWidth: number
}

type SectionComponentProps = SectionProps & {
  editingInterval?: ColumnDivision,
  editingHeight?: number,
  onEditInterval(a: EditArgs): void
}

const SectionComponent = (props: SectionComponentProps)=>{
  const {
    lithologyWidth,
    zoom,
    id,
    height,
    padding,
    range
  } = props

  const divisions = useColumnDivisions(id)
  const {
    activeDisplayMode,
    showFacies,
    showFaciesTracts,
    showCarbonIsotopes,
    showSymbols,
    showNotes
  } = useSettings()


  const {
    showTriangleBars,
    showFloodingSurfaces,
    sequenceStratOrder
  } = useContext(SequenceStratContext)

  const {inEditMode} = useContext(PlatformContext)

  // Set text of header for appropriate zoom level
  let txt = zoom > 0.5 ? "Section " : "";
  txt += id;

  const ticks = height/10;

  let paddingLeft = props.padding.left + 40

  const nOrders = sequenceStratOrder[1]-sequenceStratOrder[0]+1

  const shouldRenderGeneralized = activeDisplayMode === 'generalized';
  const shouldShowImages = (zoom >= 0.25) && !shouldRenderGeneralized;

  let lithologyLeftMargin = 0;
  if (showFaciesTracts) lithologyLeftMargin += lithologyWidth;
  if (showTriangleBars) paddingLeft += 25*nOrders

  const columnLeftMargin = lithologyLeftMargin + lithologyWidth;

  const grainsizeWidth = 168*zoom;
  const grainsizeScaleStart = 88*zoom;

  const grainsizeRange = [grainsizeScaleStart, grainsizeWidth];

  return h("div.section-pane", [
    h("div.section-container", [
      h('div.section-header', null, h("h2", txt)),
      h(ColumnProvider, {
        zoom,
        range,
        divisions
      }, [
        h('div.section', [
          h('div.section-outer', [
            h(GrainsizeLayoutProvider, {
              width: grainsizeWidth+columnLeftMargin,
              grainsizeScaleStart: grainsizeScaleStart+columnLeftMargin
            }, [
              h(ColumnSVG, {
                innerWidth: props.innerWidth + props.logWidth,
                paddingLeft,
                paddingTop: props.padding.top,
                paddingBottom: props.padding.bottom,
                paddingRight: props.padding.right
              }, [
                h(ColumnAxis, {ticks}),
                h.if(showFaciesTracts)(LithologyColumn, {width: lithologyWidth}, [
                  h(FaciesTractIntervals)
                ]),
                h('g', {transform: `translate(${lithologyLeftMargin})`}, [
                  h(LithologyColumn, {width: lithologyWidth}, [
                    h.if(showFacies)(FaciesColumnInner),
                    h(CoveredOverlay),
                    h(LithologyColumnInner)
                  ])
                ]),
                h('g', {transform: `translate(${columnLeftMargin})`}, [
                  h(GrainsizeLayoutProvider, {
                    width: grainsizeWidth,
                    grainsizeScaleStart
                  }, [
                    h(GrainsizeAxis),
                    h.if(shouldRenderGeneralized)(GeneralizedSectionColumn, {
                      range: grainsizeRange
                    }, (
                      h(LithologyColumnInner, {width: grainsizeRange[1]})
                    )),
                    h.if(showCarbonIsotopes)(Samples, {section_id: id}),
                    h.if(showFloodingSurfaces)(FloodingSurface),
                    h.if(showTriangleBars)(TriangleBars, {
                      offsetLeft: -40-25*nOrders,
                      lineWidth: 25,
                      minOrder: sequenceStratOrder[0],
                      maxOrder: sequenceStratOrder[1]
                    }),
                    h.if(showSymbols)(ManagedSymbolColumn, {id, left: 215}),
                    h.if(showNotes)(ManagedNotesColumn, {
                      visible: true,
                      id,
                      width: props.logWidth,
                      editable: inEditMode,
                      transform: `translate(${props.innerWidth})`
                    })
                  ])
                ])
              ])
            ]),
            h.if(shouldShowImages)(ColumnImages, {
              padding: {
                ...props.padding,
                left: paddingLeft
              },
              lithologyWidth: columnLeftMargin,
              imageFiles: props.imageFiles,
              extraSpace: zoom > 0.5 ? 2.5*zoom : 0,
              skeletal: false
            })
          ])
        ])
      ])
    ])
  ]);
}

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

export {SectionComponent};
