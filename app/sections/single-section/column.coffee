import {findDOMNode} from "react-dom"
import {format} from "d3-format"
import {Component, createElement, useState} from "react"
import h from "@macrostrat/hyper"
import T from "prop-types"

import {ColumnAxis} from "@macrostrat/column-components/dist/cjs/axis"
import {ColumnImages} from "./images"
import {Intent} from "@blueprintjs/core"
import {GrainsizeAxis} from "@macrostrat/column-components/dist/cjs/grainsize"
import {FloodingSurface, TriangleBars} from "@macrostrat/column-components/dist/cjs/flooding-surface"
import {
  ColumnProvider,
  ColumnContext,
  ColumnScroller,
  ColumnSVG,
  GrainsizeLayoutProvider} from '@macrostrat/column-components'
import {
  LithologyColumn,
  GeneralizedSectionColumn,
  SimplifiedLithologyColumn,
  CoveredOverlay,
  FaciesColumnInner,
  LithologyColumnInner
} from "@macrostrat/column-components/dist/cjs/lithology"
import {DivisionEditOverlay} from '@macrostrat/column-components/dist/cjs/edit-overlay'
import {StatefulComponent} from '@macrostrat/ui-components'

import Samples from "./samples"
import {ManagedSymbolColumn} from "../components"
import {ModalEditor} from "../editor"
import {Notification} from "../../notify"
import {SequenceStratConsumer} from "../sequence-strat-context"
import {
  ColumnSurfacesProvider,
  ColumnSurfacesContext
} from "../column/data-source"
import {SVGNamespaces, KnownSizeComponent} from "../util"
import {ManagedNotesColumn} from "./notes"
import {FaciesTractIntervals} from '../column/facies-tracts'

import {db, storedProcedure, query} from "~/sections/db"
import addIntervalQuery from '../sql/add-interval.sql'
import removeIntervalQuery from '../sql/remove-interval.sql'

fmt = format(".1f")

class SectionComponent extends Component
  @contextType: ColumnSurfacesContext
  @defaultProps: {
    zoom: 1
    offset: 0
    offsetTop: null
    useRelativePositioning: true
    showTriangleBars: false
    visible: true
    trackVisibility: true
    innerWidth: 250
    offsetTop: null
    scrollToHeight: null
    height: 100 # Section height in meters
    lithologyWidth: 40
    logWidth: 450
    containerWidth: 1000
    showSymbols: true
    showNotes: true
    showFacies: false
    isEditable: false
    editingInterval: {id: null}
    useRelativePositioning: true
    padding: {
      left: 30
      top: 30
      right: 0
      bottom: 30
    }
  }
  @propTypes: {
    divisions: T.arrayOf(T.object)
  }

  constructor: (props)->
    super props
    @state = {
      editingInterval: {id: null, height: null}
    }

  render: ->
    {divisions} = @context
    {id, zoom,
     scrollToHeight, height, range,
     lithologyWidth, padding
    } = @props
    {lithologyWidth, zoom, id, padding} = @props
    {logWidth, isEditable} = @props

    {editingInterval} = @state
    interval = divisions.find (d)-> d.id == editingInterval.id
    # Set text of header for appropriate zoom level
    txt = if zoom > 0.5 then "Section " else ""
    txt += id

    {lithologyWidth, zoom, id, height} = @props

    {left, top, right, bottom} = @props.padding

    ticks = height/10

    shouldRenderGeneralized = @props.activeDisplayMode == 'generalized'
    shouldShowImages = zoom >= 0.25 and not shouldRenderGeneralized

    order = @props.sequenceStratOrder

    lithologyLeftMargin = 0
    if @props.showFaciesTracts
      lithologyLeftMargin += lithologyWidth
    columnLeftMargin = lithologyLeftMargin + lithologyWidth

    grainsizeWidth = 168*zoom
    grainsizeScaleStart = 88*zoom

    grainsizeRange = [grainsizeScaleStart, grainsizeWidth]

    h "div.section-pane", [
      h "div.section-container", [
        h 'div.section-header', null, h("h2", txt)
        h ColumnProvider, {
          zoom
          range
          divisions
        }, [
          h 'div.section', [
            h 'div.section-outer', [
              h ColumnScroller, {
                scrollToHeight: parseFloat(scrollToHeight),
                paddingTop: @props.padding.top
                onScrolled: (height)=>
                  return unless height?
                  return if isNaN(height)
                  Notification.show {
                    message: "Section #{id} @ #{fmt(height)} m"
                    intent: Intent.PRIMARY
                  }
                scrollContainer: ->
                  document.querySelector('.section-pane')
              }
              h ModalEditor, {
                isOpen: editingInterval.id?
                interval
                height: editingInterval.height
                section: id
                closeDialog: =>
                  @setState {editingInterval: {id:null}}
                addInterval: @addInterval
                removeInterval: @removeInterval
                onUpdate: @onIntervalUpdated
              }
              h GrainsizeLayoutProvider, {
                width: grainsizeWidth+columnLeftMargin,
                grainsizeScaleStart: grainsizeScaleStart+columnLeftMargin
              }, [
                h DivisionEditOverlay, {
                  onClick: @onEditInterval
                  top: padding.top
                  left: padding.left
                  allowEditing: true
                }
                h ColumnSVG, {
                  innerWidth: @props.innerWidth + @props.logWidth
                  paddingLeft: @props.padding.left
                  paddingTop: @props.padding.top
                  paddingBottom: @props.padding.bottom
                }, [
                  h ColumnAxis, {ticks}
                  h.if(@props.showFaciesTracts) LithologyColumn, {width: lithologyWidth}, [
                    h FaciesTractIntervals
                  ]
                  h 'g', {transform: "translate(#{lithologyLeftMargin})"}, [
                    h LithologyColumn, {width: lithologyWidth}, [
                      h.if(@props.showFacies) FaciesColumnInner
                      h CoveredOverlay
                      h LithologyColumnInner
                    ]
                  ]
                  h 'g', {transform: "translate(#{columnLeftMargin})"}, [
                    h GrainsizeLayoutProvider, {
                      width: grainsizeWidth,
                      grainsizeScaleStart
                    }, [
                      h GrainsizeAxis
                      h.if(shouldRenderGeneralized) GeneralizedSectionColumn, {
                        range: grainsizeRange
                      }, (
                        h LithologyColumnInner, {width: grainsizeRange[1]}
                      )
                      #h.if(@props.showCarbonIsotopes) Samples, {id}
                      h.if(@props.showFloodingSurfaces) FloodingSurface
                      h.if(@props.showTriangleBars) TriangleBars, {
                        offsetLeft: -85, lineWidth: 25, orders: [order, order-1]
                      }
                      h.if(@props.showSymbols) ManagedSymbolColumn, {id, left: 215}
                      h.if(@props.showNotes) ManagedNotesColumn, {
                        visible: true
                        id
                        width: @props.logWidth
                        editable: @props.isEditable
                        transform: "translate(#{@props.innerWidth})"
                      }
                    ]
                  ]
                ]
              ]
              h.if(shouldShowImages) ColumnImages, {
                padding: @props.padding
                lithologyWidth: columnLeftMargin
                imageFiles: @props.imageFiles
                extraSpace: if zoom > 0.5 then 2.5*zoom else 0
                skeletal: false
              }
            ]
          ]
        ]
      ]
    ]

  onEditInterval: ({division, height})=>
    if not (@props.isEditable and division?)
      Notification.show {
        message: "Section #{@props.id} at #{fmt(height)} m"
      }
      return
    {id} = division
    console.log id
    @setState {editingInterval: {id, height}}

  onIntervalUpdated: =>
    # Could potentially make this fetch less
    @context.updateDivisions()

  addInterval: (height)=>
    {editingInterval} = @state
    {id: section} = @props
    sql = storedProcedure(addIntervalQuery)
    {id} = await db.one sql, {section,height}
    {id: oldID, height} = editingInterval
    if oldID?
      editingInterval = {id, height}
    else
      editingInterval = {id: null, height: null}
    @context.updateDivisions()
    @setState {editingInterval}

  removeInterval: (id)=>
    {id: section} = @props
    sql = storedProcedure(removeIntervalQuery)
    await db.none sql, {section, id}
    @context.updateDivisions()
    @setState {editingInterval: {id:null}}

SectionComponentHOC = (props)->
  {id, divisions} = props
  h SequenceStratConsumer, null, (value)->
    {showTriangleBars, showFloodingSurfaces, sequenceStratOrder} = value
    h ColumnSurfacesProvider, {id, divisions}, (
      h SectionComponent, {showTriangleBars, showFloodingSurfaces, sequenceStratOrder, props...}
    )

export {SectionComponentHOC as SectionComponent}
