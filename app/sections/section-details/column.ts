import {useContext} from "react";
import h from "@macrostrat/hyper";

import {
  ColumnDivision,
  useColumnDivisions
} from '../column/data-source'
import {
  GrainsizeAxis,
  FloodingSurface,
  TriangleBars,
  ColumnSVG,
  ColumnAxis,
  ColumnProvider,
  GrainsizeLayoutProvider,
  useSettings,
  LithologyColumn,
  CoveredOverlay,
  FaciesColumnInner,
  LithologyColumnInner,
  extractPadding,
  Padding
} from "@macrostrat/column-components";
import {useSection} from '~/sections/data-providers';
import {ColumnImages} from "../single-section/images";
import {ManagedNotesColumn} from "../single-section/notes";
import {ManagedSymbolColumn} from "../components";
import {SequenceStratContext} from "../sequence-strat-context";

interface SectionProps {
  sectionID: string,
  zoom: number,
  range?: [number, number],
  logWidth: number,
  lithologyWidth: number,
  innerWidth: number
}

const SectionComponent = (props: SectionProps & Padding)=>{
  const {
    sectionID,
    lithologyWidth,
    range,
    zoom
  } = props
  const section = useSection(sectionID)
  const divisions = useColumnDivisions(sectionID)
  const {
    showFacies,
    showFaciesTracts,
    showSymbols,
    showNotes
  } = useSettings()
  const {
    id,
    imageFiles
  } = section

  let padding = extractPadding(props)
  padding.paddingLeft += 40

  const {
    showTriangleBars,
    showFloodingSurfaces,
    sequenceStratOrder
  } = useContext(SequenceStratContext)

  // Set text of header for appropriate zoom level
  let txt = zoom > 0.5 ? "Section " : "";
  txt += id;

  const height = range[1]-range[0]
  const ticks = height/10;

  const nOrders = sequenceStratOrder[1]-sequenceStratOrder[0]+1

  let lithologyLeftMargin = 0;
  if (showFaciesTracts) lithologyLeftMargin += lithologyWidth;
  if (showTriangleBars) padding.paddingLeft += 25*nOrders

  const columnLeftMargin = lithologyLeftMargin + lithologyWidth;

  const grainsizeWidth = 168*zoom;
  const grainsizeScaleStart = 88*zoom;

  return h("div.section-pane.detail-section", [
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
                top: padding.paddingTop,
                left: 0,
                bottom: padding.paddingBottom,
                right: padding.paddingRight
              }, [
                h(ColumnAxis, {ticks}),
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
                      transform: `translate(${props.innerWidth})`
                    })
                  ])
                ])
              ])
            ]),
            h(ColumnImages, {
              ...padding,
              paddingLeft: columnLeftMargin,
              sectionID: id
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
