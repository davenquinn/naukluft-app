import {Component, createElement, createRef, useContext} from "react"
import h from "@macrostrat/hyper"
import Measure from 'react-measure'
import T from 'prop-types'
import {format} from 'd3-format'
import * as d3 from 'd3'
import Box from 'ui-box'
import {useSettings} from '#'
import {withRouter, useHistory} from "react-router-dom"

import {GrainsizeLayoutProvider, ColumnSVG} from '#'
import {ColumnAxis} from "#/axis"

import {ManagedSymbolColumn} from "../components"
import {FloodingSurface, TriangleBars} from "#/flooding-surface"
import {LithologyColumn, GeneralizedSectionColumn} from "#/lithology"
import {Popover, Position} from "@blueprintjs/core"
import {SequenceStratContext} from "../sequence-strat-context"
import {ColumnProvider, ColumnContext} from '#/context'
import {SimplifiedLithologyColumn, CoveredOverlay, FaciesColumnInner,
        LithologyColumnInner} from '#/lithology'
import {DivisionEditOverlay} from '#/edit-overlay'

import {ColumnTracker} from './link-overlay'
import {
  ColumnSurfacesProvider,
  ColumnSurfacesContext} from '../column/data-source'
import {PlatformContext} from "../../platform"
import {IntervalEditor} from "../editor"
import {Notification} from "../../notify"
import {FaciesContext} from "../facies"
import {SVGNamespaces, KnownSizeComponent} from "../util"
import {MinimalIsotopesColumn} from './chemostrat'
import {FaciesTractIntervals} from '../column/facies-tracts'

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

ColumnMain = ->
  {showFacies, showFaciesTracts} = useSettings()
  h GeneralizedSectionColumn, [
    h.if(showFacies) FaciesColumnInner
    h.if(showFaciesTracts) FaciesTractIntervals
    h CoveredOverlay
    h SimplifiedLithologyColumn
  ]

EditOverlay = (props)->
  try
    history = useHistory()
    navigateTo = history.push
  catch
    navigateTo = ->
  {id, rest...} = props
  onClick = ({height})->
    {id} = props
    path = "/sections/#{id}"
    if height?
      path += "/height/#{height}"
    console.log height, path
    navigateTo(path)

  renderEditorPopup = (interval)->
    return null unless interval?
    h IntervalEditor, {interval}

  h DivisionEditOverlay, {
    showInfoBox: true
    renderEditorPopup
    onClick
    rest...
  }

ColumnSummaryAxis = (props)->
  {height, zoom} = useContext(ColumnContext)
  h ColumnAxis, {ticks: (height*zoom)/5}

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
    isotopesPerSection: T.bool
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

  render: ->
    {id, zoom, padding, lithologyWidth,
     innerWidth, onResize, marginLeft,
     showFacies, height,
     showTriangleBars,
     showFloodingSurfaces,
     showWhiteUnderlay,
     inEditMode
     position,
     range,
     pixelsPerMeter
     children
     } = @props

    {heightScale} = position
    innerHeight = heightScale.pixelHeight()
    marginTop = heightScale.pixelOffset()

    {left, top, right, bottom} = padding

    outerHeight = innerHeight+(top+bottom)
    outerWidth = innerWidth+(left+right)

    {divisions} = @context
    {visible} = @state
    divisions = divisions.filter (d)->not d.schematic

    {skeletal} = @props

    overhangLeft = 0
    overhangRight = 0

    {triangleBarsOffset: tbo, triangleBarRightSide: onRight} = @props
    marginLeft -= tbo
    marginRight = 0
    outerWidth += tbo
    if @props.isotopesPerSection
      isotopesWidth = 60
      outerWidth += 100

    if showTriangleBars
      offsetLeft = -tbo+35
      if onRight
        overhangRight = 45
        offsetLeft *= -1
        offsetLeft += tbo+20
      else
        overhangLeft = 25
        left = tbo

    # Expand SVG past bounds of section

    domID = "column-#{id}"

    grainsizeScaleStart = 40

    h Box, {
      className: 'section-container'
      position: 'absolute'
      top: marginTop
      width: outerWidth
      marginLeft: -overhangLeft
      marginRight: -overhangRight
    }, [
      h 'div.section-header', [
        h("h2", {style: {zIndex: 20}}, id)
      ]
      h 'div.section-outer', {id: domID}, [
        h ColumnProvider, {
          range
          height: @props.height
          zoom: 0.1
          divisions
        }, [
          h ColumnTracker, {domID, id}
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
              paddingBottom: 10
              paddingLeft: @props.padding.left
            }, [
              h.if(@props.showWhiteUnderlay) 'rect.underlay', {
                width: outerWidth
                height: innerHeight+10
                x: -left
                y: -5
                fill: 'white'
              }
              h ColumnMain
              h ManagedSymbolColumn, {
                left: 90
                id
              }
              h.if(@props.showFloodingSurfaces) FloodingSurface, {
                offsetLeft: -40
                lineWidth: 30
              }
              h.if(@props.showTriangleBars) TriangleBars, {
                id
                offsetLeft
                lineWidth: 20
                orders: [@props.sequenceStratOrder, @props.sequenceStratOrder-1]
              }
              h ColumnSummaryAxis
              h.if(@props.isotopesPerSection) MinimalIsotopesColumn, {
                width: 60,
                section: id
                transform: 'translate(120)'
              }
            ]
          ]
          children
        ]
      ]
    ]


SVGSectionComponent = (props)->
  {id, divisions} = props
  {inEditMode} = useContext(PlatformContext)
  {showTriangleBars,
  showFloodingSurfaces,
  sequenceStratOrder} = useContext(SequenceStratContext)

  h ColumnSurfacesProvider, {id, divisions}, (
    h BaseSVGSectionComponent, {
      showTriangleBars, showFloodingSurfaces,
      sequenceStratOrder, inEditMode, props...,
    }
  )

export {BaseSVGSectionComponent, SVGSectionComponent}
