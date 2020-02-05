/*
 * decaffeinate suggestions:
 * DS001: Remove Babel/TypeScript constructor workaround
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import {format} from "d3-format";
import {useState, useContext} from "react";
import h from "@macrostrat/hyper";

import {
  ColumnDivision,
  ColumnDivisionsContext,
  useColumnDivisions
} from '../column/data-source'
import {PlatformContext} from '~/platform'
import {ColumnAxis} from "@macrostrat/column-components/dist/esm/axis";
import {ColumnImages} from "./images";
import {Intent} from "@blueprintjs/core";
import {GrainsizeAxis} from "@macrostrat/column-components/dist/esm/grainsize";
import {FloodingSurface, TriangleBars} from "@macrostrat/column-components/dist/esm/flooding-surface";
import {
  ColumnSVG,
  ColumnProvider,
  ColumnScroller,
  GrainsizeLayoutProvider,
  useSettings
} from '@macrostrat/column-components';
import {
  LithologyColumn,
  GeneralizedSectionColumn,
  CoveredOverlay,
  FaciesColumnInner,
  LithologyColumnInner
} from "@macrostrat/column-components/dist/esm/lithology";
import {DivisionEditOverlay} from '@macrostrat/column-components/dist/esm/edit-overlay';

import Samples from "./samples";
import {ManagedSymbolColumn} from "../components";
import {ModalEditor, Direction} from "../editor";
import {IToastProps} from '@blueprintjs/core'
import {Notification} from "../../notify";
import {SequenceStratContext} from "../sequence-strat-context";

import {ManagedNotesColumn} from "./notes";
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


interface Padding {
  left: number,
  right: number,
  top: number,
  bottom: number
}

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

type SectionInnerProps = SectionProps & {
  editingInterval?: ColumnDivision,
  editingHeight?: number,
  onEditInterval(a: EditArgs): void
}

const SectionInner = (props: SectionInnerProps)=>{
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

  const shouldRenderGeneralized = activeDisplayMode === 'generalized';
  const shouldShowImages = (zoom >= 0.25) && !shouldRenderGeneralized;

  let lithologyLeftMargin = 0;
  if (showFaciesTracts) lithologyLeftMargin += lithologyWidth;

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
            h(ColumnScroller, {
              scrollToHeight,
              paddingTop: props.padding.top,
              onScrolled: notifyScroll(id),
              scrollContainer() {
                return document.querySelector('.section-pane');
              }
            }),
            h(GrainsizeLayoutProvider, {
              width: grainsizeWidth+columnLeftMargin,
              grainsizeScaleStart: grainsizeScaleStart+columnLeftMargin
            }, [
              h(DivisionEditOverlay, {
                onClick: onEditInterval,
                editingInterval,
                selectedHeight: editingHeight,
                top: padding.top,
                left: padding.left,
                allowEditing: inEditMode
              }),
              h(ColumnSVG, {
                innerWidth: props.innerWidth + props.logWidth,
                paddingLeft: props.padding.left,
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
                      offsetLeft: -85,
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
              padding: props.padding,
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

SectionInner.defaultProps = {
  zoom: 1
}

const SectionComponent = (props: SectionProps)=> {
  const {inEditMode: isEditable} = useContext(PlatformContext)
  const {updateDivisions} = useContext(ColumnDivisionsContext)

  const {id: section_id} = props
  const divisions = useColumnDivisions(section_id)

  const [editingInterval, setEditingInterval] = useState<EditingInterval>(nullDivision)

  /* EDITING FUNCTIONS */
  function editInterval({division, height}: EditArgs){
    if (!isEditable && division != null) {
      return sectionNotify(section_id, height);
    }
    const {id} = division;
    setEditingInterval({id, height});
  }

  async function addInterval(height: number) {
    const sql = storedProcedure(addIntervalQuery);
    const {id: newID} = await db.one(sql, {section: section_id, height});
    const {id: oldID, height: newHeight} = editingInterval;
    let interval: EditingInterval = nullDivision;

    // If we are editing the old interval, keep editing
    if (oldID != null) interval = {id: newID, height: newHeight};
    setEditingInterval(interval);
  };

  async function removeInterval(id: number) {
    const sql = storedProcedure(removeIntervalQuery);
    await db.none(sql, {section: section_id, id});
    updateDivisions();
    setEditingInterval(nullDivision);
  };

  function moveCursor(direction: Direction){
    let ix = divisions.findIndex(d=>d.id == editingInterval.id)
    switch(direction) {
      case Direction.Down: {
        if (ix > 0) ix -= 1
        break
      }
      case Direction.Up: {
        if (ix < divisions.length-1) ix += 1
        break
      }
    }
    const {id: newID} = divisions[ix]
    setEditingInterval({id: newID, height: null})
  }

  function closeDialog(){
    setEditingInterval(nullDivision)
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
      isOpen: (interval != null),
      interval,
      height: editingInterval.height,
      section: section_id,
      moveCursor,
      closeDialog() {
        setEditingInterval(nullDivision)
      },
      addInterval,
      removeInterval
    })
  ])
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
