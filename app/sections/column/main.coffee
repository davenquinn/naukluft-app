import {findDOMNode} from "react-dom"
import {format} from "d3-format"
import {Component, createElement} from "react"
import h from "@macrostrat/hyper"
import {ColumnAxis} from "@macrostrat/column-components/src/axis"
import {ColumnImages} from "@macrostrat/column-components/src/images"
import {NotesColumn} from "@macrostrat/column-components/src/notes"
import "@macrostrat/column-components/src/main.styl"
import {Intent} from "@blueprintjs/core"
import {Notification} from "../../notify"
import {GrainsizeAxis} from "@macrostrat/column-components/src/grainsize"
import {SymbolColumn} from "@macrostrat/column-components/src/symbol-column"
import {ModalEditor} from "@macrostrat/column-components/src/editor"
import {ColumnSurfacesProvider, ColumnSurfacesContext} from "./data-source"
import {SVGNamespaces, KnownSizeComponent} from "../util"
import Samples from "@macrostrat/column-components/src/samples"
import {FloodingSurface, TriangleBars} from "@macrostrat/column-components/src/flooding-surface"
import {ColumnProvider, ColumnContext, GrainsizeLayoutProvider} from '@macrostrat/column-components'
import {
  LithologyColumn,
  GeneralizedSectionColumn,
  SimplifiedLithologyColumn,
  CoveredOverlay,
  FaciesColumnInner,
  LithologyColumnInner
} from "@macrostrat/column-components/src/lithology"
import {SequenceStratConsumer} from "../sequence-strat-context"
import {DivisionEditOverlay} from '@macrostrat/column-components/src/edit-overlay'
import {db, storedProcedure, query} from "app/sections/db"
import {dirname} from "path"
import update from "immutability-helper"
import T from "prop-types"
import {StatefulComponent} from '@macrostrat/ui-components'

fmt = format(".1f")
baseDir = dirname require.resolve '..'
sql = (id)-> storedProcedure(id, {baseDir})

class ScrollToHeightComponent extends Component
  @contextType: ColumnContext
  @propTypes: {
    scrollToHeight: T.number
    id: T.string
  }
  constructor: (props)->
    super props
    @state = {loaded: false}
  render: ->
    h 'div.section-outer', null, @props.children
  componentDidUpdate: ->
    node = findDOMNode(@)
    {scale} = @context
    {scrollToHeight, id} = @props
    {loaded} = @state
    return unless scrollToHeight?
    return if loaded
    scrollTop = scale(scrollToHeight)-window.innerHeight/2
    node.scrollTop = scrollTop

    Notification.show {
      message: "Section #{id} @ #{fmt(scrollToHeight)} m"
      intent: Intent.PRIMARY
    }
    @setState {loaded: true}

class ManagedNotesColumn extends StatefulComponent
  constructor: (props)->
    super props
    @state = {notes: []}

  componentDidMount: =>
    @updateNotes()

  updateNotes: =>
    {id} = @props
    notes = await query 'log-notes', [id]
    @setState {notes}

  render: ->
    {notes} = @state
    h NotesColumn, {notes, @props...}

class SectionComponent extends KnownSizeComponent
  @contextType: ColumnSurfacesContext
  @defaultProps: {
    zoom: 1
    pixelsPerMeter: 20
    skeletal: false
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
      left: 150
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
    {id, zoom, pixelsPerMeter,
     scrollToHeight, height,
     skeletal, range,
     lithologyWidth, padding
    } = @props
    {lithologyWidth, zoom, id, padding} = @props
    {logWidth, isEditable} = @props

    {editingInterval} = @state
    interval = divisions.find (d)-> d.id == editingInterval.id
    # Set text of header for appropriate zoom level
    txt = if zoom > 0.5 then "Section " else ""
    txt += id

    grainsizeWidth = 168*zoom+lithologyWidth
    grainsizeScaleStart = 88*zoom+lithologyWidth

    grainsizeRange = [grainsizeScaleStart, grainsizeWidth]

    {lithologyWidth, zoom, id, height, pixelsPerMeter} = @props

    innerHeight = height*pixelsPerMeter
    {left, top, right, bottom} = @props.padding
    outerHeight = innerHeight+(top+bottom)
    outerWidth = innerWidth+(left+right)

    ticks = height/10

    shouldRenderGeneralized = @props.activeDisplayMode == 'generalized'

    order = @props.sequenceStratOrder

    h "div#section-pane", [
      h "div.section-container", {
        className: if skeletal then "skeleton" else null
      }, [
        h 'div.section-header', [h "h2", txt]
        h ColumnProvider, {
          zoom
          range
          height
          divisions
          pixelsPerMeter
          width: grainsizeWidth
          grainsizeScaleStart
        }, (
          h ScrollToHeightComponent, {
            scrollToHeight: parseFloat(scrollToHeight)
            id
          }, [
            h 'div.section', [
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
                width: grainsizeWidth,
                grainsizeScaleStart
              }, [
                h "svg.overlay", {
                  SVGNamespaces...
                  width: outerWidth
                  height: outerHeight
                }, [
                  h 'g.backdrop', {
                    transform: "translate(#{@props.padding.left} #{@props.padding.top})"
                  }, [
                    h ColumnAxis, {ticks}
                    h LithologyColumn, {width: lithologyWidth}, [
                      h.if(@props.showFacies) FaciesColumnInner, {width: lithologyWidth}
                      h CoveredOverlay, {width: lithologyWidth}
                      h LithologyColumnInner, {width: lithologyWidth}
                    ]
                    h GrainsizeLayoutProvider, {
                      width: grainsizeWidth,
                      grainsizeScaleStart
                    }, [
                      h GrainsizeAxis
                      h.if(shouldRenderGeneralized) GeneralizedSectionColumn, {range: grainsizeRange}, (
                        h LithologyColumnInner, {width: grainsizeRange[1]}
                      )
                      h.if(@props.showCarbonIsotopes) Samples, {id}
                      h.if(@props.showFloodingSurfaces) FloodingSurface
                      h.if(@props.showTriangleBars) TriangleBars, {
                        offsetLeft: -85, lineWidth: 25, orders: [order, order-1]
                      }
                      h.if(@props.showSymbols) SymbolColumn, {id, left: 215}
                      h.if(@props.showNotes and zoom > 0.50) ManagedNotesColumn, {
                        visible: true
                        id
                        width: @props.logWidth*zoom
                        inEditMode: @props.isEditable
                        transform: "translate(#{@props.innerWidth})"
                      }
                    ]
                  ]
                ]
              ]
              h.if(zoom >= 0.25) ColumnImages, {
                padding: @props.padding
                lithologyWidth: @props.lithologyWidth
                imageFiles: @props.imageFiles
                extraSpace: if zoom > 0.5 then 2.5*zoom else 0
                skeletal: false
              }
              h DivisionEditOverlay, {
                onClick: @onEditInterval
                width: lithologyWidth
                top: padding.top
                left: padding.left
                allowEditing: true
              }
            ]
          ]
        )
      ]
    ]

  onEditInterval: ({division, height})=>
    if not (@props.isEditable and division?)
      Notification.show {
        message: "Section #{@props.id} at #{fmt(height)} m"
      }
      return
    {id} = division
    @setState {editingInterval: {id, height}}

  onIntervalUpdated: =>
    # Could potentially make this fetch less
    @context.updateDivisions()

  addInterval: (height)=>
    {editingInterval} = @state
    {id: section} = @props
    {id} = await db.one sql('add-interval'), {section,height}
    {id: oldID, height} = editingInterval
    if oldID?
      editingInterval = {id, height}
    else
      editingInterval = {id: null, height: null}
    @context.updateDivisions()
    @setState {editingInterval}

  removeInterval: (id)=>
    {id: section} = @props
    await db.none sql('remove-interval'), {section, id}
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
