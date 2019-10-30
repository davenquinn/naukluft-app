import {Component, createElement, createRef, useContext} from "react"
import h from "@macrostrat/hyper"
import Measure from 'react-measure'
import {GrainsizeLayoutProvider, ColumnSVG} from '~/bundled-deps/column-components'
import {ColumnAxis} from "~/bundled-deps/column-components/src/axis"
import {PlatformContext} from "../../platform"
import {SymbolColumn} from "~/bundled-deps/column-components/src/symbol-column"
import {FloodingSurface, TriangleBars} from "~/bundled-deps/column-components/src/flooding-surface"
import {IntervalEditor} from "~/bundled-deps/column-components/src/editor"
import {LithologyColumn, GeneralizedSectionColumn} from "~/bundled-deps/column-components/src/lithology"
import {Popover, Position} from "@blueprintjs/core"
import {withRouter, useHistory} from "react-router-dom"
import {Notification} from "../../notify"
import {FaciesContext} from "../facies"
import {SVGNamespaces, KnownSizeComponent} from "../util"
import {SequenceStratContext} from "../sequence-strat-context"
import {db, storedProcedure, query} from "../db"
import {ColumnProvider, ColumnContext} from '~/bundled-deps/column-components/src/context'
import {SimplifiedLithologyColumn, CoveredOverlay, FaciesColumnInner,
        LithologyColumnInner} from '~/bundled-deps/column-components/src/lithology'
import {DivisionEditOverlay} from '~/bundled-deps/column-components/src/edit-overlay'
import {ColumnSurfacesProvider, ColumnSurfacesContext} from './data-source'
import T from 'prop-types'
import {format} from 'd3-format'
import * as d3 from 'd3'

fmt = format('.1f')

IntervalNotification = (props)->
  {id, height, bottom, top, surface} = props
  h 'div', [
    h 'h4', "Section #{id} @ #{fmt(height)} m"
    h 'p', [
      'Interval ID: '
      h('code', id)
    ]
    h 'p', "#{bottom} - #{top} m"
    if surface then h('p', ["Surface: ", h('code',surface)]) else null
  ]

EditOverlay = (props)->
  history = useHistory()
  {id, rest...} = props

  onClick = ({height})=>
    {id} = props
    path = "/sections/#{id}"
    if height?
      path += "/height/#{height}"
    console.log height, path
    history.push(path)

  h DivisionEditOverlay, {
    showInfoBox: true
    onClick
    rest...
  }

class BaseSVGSectionComponent extends KnownSizeComponent
  @contextType: ColumnSurfacesContext
  @defaultProps: {
    zoom: 1
    pixelsPerMeter: 20
    inEditMode: false
    skeletal: false
    offset: 0
    offsetTop: null
    useRelativePositioning: true
    showTriangleBars: false
    trackVisibility: false
    innerWidth: 100
    height: 100 # Section height in meters
    lithologyWidth: 40
    showWhiteUnderlay: true
    showFacies: true
    triangleBarsOffset: 0
    triangleBarRightSide: false
    onResize: ->
    marginLeft: -10
    padding: {
      left: 30
      top: 10
      right: 20
      bottom: 10
    }
  }
  @propTypes: {
    #inEditMode: T.bool
    range: T.arrayOf(T.number).isRequired
  }
  constructor: (props)->
    super props
    @measureRef = createRef()

    @state = {
      @state...
      hoveredInterval: null
      popoverIsOpen: false
      visible: not @props.trackVisibility
    }

  renderWhiteUnderlay: ->
    {showWhiteUnderlay, skeletal} = @props
    return null if not showWhiteUnderlay
    return null if skeletal
    {innerWidth, padding, marginLeft, position: pos} = @props
    innerHeight = pos.heightScale.pixelHeight()
    {left, right} = padding
    outerWidth = innerWidth+(left+right)

    {triangleBarsOffset: tbo, triangleBarRightSide: onRight} = @props
    left += tbo
    marginLeft -= tbo
    marginRight = 0
    outerWidth += tbo

    x = -left
    if @props.showTriangleBars and not onRight
      x += 55
    if @props.showTriangleBars and onRight
      outerWidth += 75

    return h 'rect.underlay', {
      width: outerWidth-50
      height: innerHeight+10
      x
      y: -5
      fill: 'white'
    }

  hoverAdjacent: (offset=1) => =>
    {divisions} = @props
    {hoveredInterval} = @state
    return if not hoveredInterval?
    ix = divisions.findIndex (d)->d.id = hoveredInterval.id
    return unless ix?
    newDiv = divisions[ix+offset]
    return unless newDiv?
    @setState {hoveredInterval: newDiv}

  onIntervalUpdated: =>
    console.log "Updating intervals"
    {id: section} = @props
    # Could potentially make this fetch less
    divisions = await @context.updateDivisions()
    {hoveredInterval} = @state
    return unless hoveredInterval?
    newHovered = divisions.find (d)-> d.id == hoveredInterval.id
    @setState {hoveredInterval: newHovered}

  renderEditOverlay: ({left})=>
    grainsizeScaleStart = 40
    {inEditMode, innerWidth, history} = @props

    onClick = ({height})=>
      {id} = props
      path = "/sections/#{id}"
      if height?
        path += "/height/#{height}"
      console.log height, path
      history.push(path)

    h DivisionEditOverlay, {
      width: innerWidth
      left,
      top: @props.padding.top
      grainsizeScaleRange: [grainsizeScaleStart, innerWidth]
      showInfoBox: true
      allowEditing: inEditMode
      history # This is a shameless hack
      onClick
    }

  renderFloodingSurfaces: =>
    return null unless @props.showFloodingSurfaces
    h FloodingSurface, {
      offsetLeft: -40
      lineWidth: 30
    }

  renderTriangleBars: =>
    return null unless @props.showTriangleBars
    {id, triangleBarsOffset: tbo, triangleBarRightSide: onRight} = @props

    offsetLeft = -tbo+35
    if onRight
      offsetLeft *= -1
      offsetLeft += tbo+20

    h TriangleBars, {
      id
      offsetLeft
      lineWidth: 20
      orders: [@props.sequenceStratOrder, @props.sequenceStratOrder-1]
    }

  render: ->
    {id, zoom, padding, lithologyWidth,
     innerWidth, onResize, marginLeft,
     showFacies, height, clip_end,
     showTriangleBars,
     showFloodingSurfaces,
     showWhiteUnderlay,
     inEditMode
     position,
     range,
     pixelsPerMeter
     } = @props

    {heightScale} = position
    innerHeight = heightScale.pixelHeight()
    marginTop = heightScale.pixelOffset()
    scale = heightScale.local

    {left, top, right, bottom} = padding

    outerHeight = innerHeight+(top+bottom)
    outerWidth = innerWidth+(left+right)

    {divisions} = @context
    {visible} = @state
    divisions = divisions.filter (d)->not d.schematic

    {skeletal} = @props

    # Set up number of ticks
    nticks = (height*@props.zoom)/10

    overhangLeft = 0
    overhangRight = 0

    {triangleBarsOffset: tbo, triangleBarRightSide: onRight} = @props
    marginLeft -= tbo
    marginRight = 0
    outerWidth += tbo

    if showTriangleBars
      offsetLeft = -tbo+35
      if onRight
        overhangRight = 45
        offsetLeft *= -1
        offsetLeft += tbo+20
        marginRight -= tbo
        marginLeft += tbo
      else
        overhangLeft = 25
        left = tbo

    # Expand SVG past bounds of section
    style = {
      width: outerWidth
      height: outerHeight
    }

    transform = "translate(#{left} #{@props.padding.top})"

    minWidth = outerWidth
    position = 'absolute'
    top = marginTop

    grainsizeScaleStart = 40

    h "div.section-container", {
      className: if @props.skeletal then "skeleton" else null
      style: {
        minWidth, top, position,
        marginLeft: -overhangLeft
        marginRight: -overhangRight
      }
    }, [
      h 'div.section-header', [
        h("h2", {style: {zIndex: 20}}, id)
      ]
      h 'div.section-outer', [
        h ColumnProvider, {
          range
          height: @props.height
          zoom: 0.1
          divisions
        }, [
          h GrainsizeLayoutProvider, {
            width: innerWidth,
            grainsizeScaleStart
          }, [
            h EditOverlay, {
              id,
              allowEditing: true
              left,
              top: @props.padding.top
            }
            h ColumnSVG, {
              width: outerWidth
              paddingTop: @props.padding.top
              paddingLeft: @props.padding.left
            }, [
              @renderWhiteUnderlay()
              h GeneralizedSectionColumn, [
                h.if(showFacies) FaciesColumnInner
                h CoveredOverlay
                h SimplifiedLithologyColumn
              ]
              h SymbolColumn, {
                height: innerHeight
                left: 90
                id
                zoom
              }
              @renderFloodingSurfaces()
              @renderTriangleBars()
              h ColumnAxis
            ]
          ]
        ]
      ]
    ]


SVGSectionComponent = (props)->
  {id, divisions} = props
  {inEditMode} = useContext(PlatformContext)
  {showTriangleBars, showFloodingSurfaces, sequenceStratOrder} = useContext(SequenceStratContext)

  h ColumnSurfacesProvider, {id, divisions}, (
    h BaseSVGSectionComponent, {
      showTriangleBars, showFloodingSurfaces,
      sequenceStratOrder, inEditMode, props...,
    }
  )

export {BaseSVGSectionComponent, SVGSectionComponent}
