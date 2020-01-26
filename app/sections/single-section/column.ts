/*
 * decaffeinate suggestions:
 * DS001: Remove Babel/TypeScript constructor workaround
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import {findDOMNode} from "react-dom";
import {format} from "d3-format";
import {Component, createElement, useState} from "react";
import h from "@macrostrat/hyper";
import T from "prop-types";

import {ColumnAxis} from "@macrostrat/column-components/dist/cjs/axis";
import {ColumnImages} from "./images";
import {Intent} from "@blueprintjs/core";
import {GrainsizeAxis} from "@macrostrat/column-components/dist/cjs/grainsize";
import {FloodingSurface, TriangleBars} from "@macrostrat/column-components/dist/cjs/flooding-surface";
import {
  ColumnProvider,
  ColumnContext,
  ColumnScroller,
  ColumnSVG,
  GrainsizeLayoutProvider} from '@macrostrat/column-components';
import {
  LithologyColumn,
  GeneralizedSectionColumn,
  SimplifiedLithologyColumn,
  CoveredOverlay,
  FaciesColumnInner,
  LithologyColumnInner
} from "@macrostrat/column-components/dist/cjs/lithology";
import {DivisionEditOverlay} from '@macrostrat/column-components/dist/cjs/edit-overlay';
import {StatefulComponent} from '@macrostrat/ui-components';

import Samples from "./samples";
import {ManagedSymbolColumn} from "../components";
import {ModalEditor} from "../editor";
import {Notification} from "../../notify";
import {SequenceStratConsumer} from "../sequence-strat-context";
import {
  ColumnDivisionsProvider,
  ColumnDivisionsContext
} from "../column/data-source";
import {SVGNamespaces, KnownSizeComponent} from "../util";
import {ManagedNotesColumn} from "./notes";
import {FaciesTractIntervals} from '../column/facies-tracts';

import {db, storedProcedure, query} from "~/sections/db";
import addIntervalQuery from '../sql/add-interval.sql';
import removeIntervalQuery from '../sql/remove-interval.sql';

const fmt = format(".1f");

class SectionComponent extends Component {
  static initClass() {
    this.contextType = ColumnDivisionsContext;
    this.defaultProps = {
      zoom: 1,
      offset: 0,
      offsetTop: null,
      useRelativePositioning: true,
      showTriangleBars: false,
      visible: true,
      trackVisibility: true,
      innerWidth: 250,
      offsetTop: null,
      scrollToHeight: null,
      height: 100, // Section height in meters
      lithologyWidth: 40,
      logWidth: 450,
      containerWidth: 1000,
      showSymbols: true,
      showNotes: true,
      showFacies: false,
      isEditable: false,
      editingInterval: {id: null},
      useRelativePositioning: true,
      padding: {
        left: 30,
        top: 30,
        right: 30,
        bottom: 30
      }
    };
    this.propTypes = {
      divisions: T.arrayOf(T.object)
    };
  }

  constructor(props){
    super(props);
    this.state = {
      editingInterval: {id: null, height: null}
    };
    this.onEditInterval = this.onEditInterval.bind(this);
    this.onIntervalUpdated = this.onIntervalUpdated.bind(this);
    this.moveEditorCursor = this.moveEditorCursor.bind(this);

  }

  render() {
    const {divisions} = this.context;
    let {id, zoom,
     scrollToHeight, height, range,
     lithologyWidth, padding
    } = this.props;
    ({lithologyWidth, zoom, id, padding} = this.props);
    const {logWidth, isEditable} = this.props;

    const {editingInterval} = this.state;
    const interval = divisions.find(d => d.id === editingInterval.id);
    // Set text of header for appropriate zoom level
    let txt = zoom > 0.5 ? "Section " : "";
    txt += id;

    ({lithologyWidth, zoom, id, height} = this.props);

    const {left, top, right, bottom} = this.props.padding;

    const ticks = height/10;

    const shouldRenderGeneralized = this.props.activeDisplayMode === 'generalized';
    const shouldShowImages = (zoom >= 0.25) && !shouldRenderGeneralized;

    const order = this.props.sequenceStratOrder;

    let lithologyLeftMargin = 0;
    if (this.props.showFaciesTracts) {
      lithologyLeftMargin += lithologyWidth;
    }
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
                scrollToHeight: parseFloat(scrollToHeight),
                paddingTop: this.props.padding.top,
                onScrolled: height=> {
                  if (height == null) { return; }
                  if (isNaN(height)) { return; }
                  return Notification.show({
                    message: `Section ${id} @ ${fmt(height)} m`,
                    intent: Intent.PRIMARY
                  });
                },
                scrollContainer() {
                  return document.querySelector('.section-pane');
                }
              }),
              h(ModalEditor, {
                isOpen: (interval != null),
                interval,
                height: editingInterval.height,
                section: id,
                closeDialog: () => {
                  console.log("Closing dialog");
                  return this.setState({editingInterval: {id:null}});
                },
                addInterval: this.addInterval,
                removeInterval: this.removeInterval,
                moveCursor: this.moveEditorCursor,
                onUpdate: this.onIntervalUpdated
              }),
              h(GrainsizeLayoutProvider, {
                width: grainsizeWidth+columnLeftMargin,
                grainsizeScaleStart: grainsizeScaleStart+columnLeftMargin
              }, [
                h(DivisionEditOverlay, {
                  onClick: this.onEditInterval,
                  editingInterval: interval,
                  top: padding.top,
                  left: padding.left,
                  allowEditing: true
                }),
                h(ColumnSVG, {
                  innerWidth: this.props.innerWidth + this.props.logWidth,
                  paddingLeft: this.props.padding.left,
                  paddingTop: this.props.padding.top,
                  paddingBottom: this.props.padding.bottom,
                  paddingRight: this.props.padding.right
                }, [
                  h(ColumnAxis, {ticks}),
                  h.if(this.props.showFaciesTracts)(LithologyColumn, {width: lithologyWidth}, [
                    h(FaciesTractIntervals)
                  ]),
                  h('g', {transform: `translate(${lithologyLeftMargin})`}, [
                    h(LithologyColumn, {width: lithologyWidth}, [
                      h.if(this.props.showFacies)(FaciesColumnInner),
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
                      //h.if(@props.showCarbonIsotopes) Samples, {id}
                      h.if(this.props.showFloodingSurfaces)(FloodingSurface),
                      h.if(this.props.showTriangleBars)(TriangleBars, {
                        offsetLeft: -85, lineWidth: 25, orders: [order, order-1]
                      }),
                      h.if(this.props.showSymbols)(ManagedSymbolColumn, {id, left: 215}),
                      h.if(this.props.showNotes)(ManagedNotesColumn, {
                        visible: true,
                        id,
                        width: this.props.logWidth,
                        editable: this.props.isEditable,
                        transform: `translate(${this.props.innerWidth})`
                      })
                    ])
                  ])
                ])
              ]),
              h.if(shouldShowImages)(ColumnImages, {
                padding: this.props.padding,
                lithologyWidth: columnLeftMargin,
                imageFiles: this.props.imageFiles,
                extraSpace: zoom > 0.5 ? 2.5*zoom : 0,
                skeletal: false
              })
            ])
          ])
        ])
      ])
    ]);
  }

  onEditInterval({division, height}){
    if (!(this.props.isEditable && (division != null))) {
      Notification.show({
        message: `Section ${this.props.id} at ${fmt(height)} m`
      });
      return;
    }
    const {id} = division;
    console.log(id);
    return this.setState({editingInterval: {id, height}});
  }

  onIntervalUpdated() {
    // Could potentially make this fetch less
    return this.context.updateDivisions();
  }

  addInterval = async height=> {
    let oldID;
    let {editingInterval} = this.state;
    const {id: section} = this.props;
    const sql = storedProcedure(addIntervalQuery);
    const {id} = await db.one(sql, {section,height});
    ({id: oldID, height} = editingInterval);
    if (oldID != null) {
      editingInterval = {id, height};
    } else {
      editingInterval = {id: null, height: null};
    }
    this.context.updateDivisions();
    return this.setState({editingInterval});
  };

  removeInterval = async id=> {
    const {id: section} = this.props;
    const sql = storedProcedure(removeIntervalQuery);
    await db.none(sql, {section, id});
    this.context.updateDivisions();
    return this.setState({editingInterval: {id:null}});
  };

  moveEditorCursor(direction){
    return console.log(direction);
  }

  componentDidUpdate(prevProps, prevState){
    if (this.state.editingInterval !== prevState.editingInterval) {
      return console.log(this.state.editingInterval);
    }
  }
}
SectionComponent.initClass();

const SectionComponentHOC = function(props){
  const {id, divisions} = props;
  return h(SequenceStratConsumer, null, function(value){
    const {showTriangleBars, showFloodingSurfaces, sequenceStratOrder} = value;
    return h(ColumnDivisionsProvider, {id, divisions}, (
      h(SectionComponent, {showTriangleBars, showFloodingSurfaces, sequenceStratOrder, ...props})
    ));
  });
};

export {SectionComponentHOC as SectionComponent};
