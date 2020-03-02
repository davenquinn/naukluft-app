import {useContext} from "react";
import h from "@macrostrat/hyper";

import {useColumnDivisions} from '../column/data-source'
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
    innerWidth,
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

  const showTriangleBars = true
  const showFloodingSurfaces = false
  const sequenceStratOrder = [1,2]


  const height = range[1]-range[0]
  const ticks = height/5;

  const nOrders = sequenceStratOrder[1]-sequenceStratOrder[0]+1

  let lithologyLeftMargin = 0;
  if (showFaciesTracts) lithologyLeftMargin += lithologyWidth;
  if (showTriangleBars) padding.paddingLeft += 25*nOrders

  const columnLeftMargin = lithologyLeftMargin + lithologyWidth;
  const pixelsPerMeter = 15

  const grainsizeWidth = (168/20)*pixelsPerMeter*zoom;
  const grainsizeScaleStart = (88/20)*pixelsPerMeter*zoom;

  return h("div.section-pane.detail-section", [
    h("div.section-container", [
      // h("h3", [
      //   id, " ",
      //   h("span.height-range", `${range[0]}–${range[1]} m`)
      // ]),
      h(ColumnProvider, {
        pixelsPerMeter,
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
                innerWidth,
                ...padding
              }, [
                h(TriangleBars, {
                  offsetLeft: -40-20*nOrders,
                  lineWidth: 20,
                  minOrder: sequenceStratOrder[0],
                  maxOrder: sequenceStratOrder[1]
                }),
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
                    h(FloodingSurface),
                    h(ManagedSymbolColumn, {id, left: 50}),
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
              paddingLeft: padding.paddingLeft+lithologyWidth,
              sectionID
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
  innerWidth: 300,
  offsetTop: null,
  scrollToHeight: null,
  lithologyWidth: 40,
  logWidth: 450,
  containerWidth: 1000,
  padding: 10,
};

export {SectionComponent};
