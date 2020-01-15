import {Component, createElement, createRef, useContext} from "react"
import Measure from 'react-measure'
import T from 'prop-types'
import {format} from 'd3-format'
import * as d3 from 'd3'
import Box from 'ui-box'
import {useSettings} from '@macrostrat/column-components'
import {withRouter, useHistory} from "react-router-dom"

import {GrainsizeLayoutProvider, ColumnSVG, ColumnBox} from '@macrostrat/column-components'
import {ColumnAxis} from "@macrostrat/column-components/dist/cjs/axis"

import {ManagedSymbolColumn} from "../components"
import {FloodingSurface, TriangleBars} from "@macrostrat/column-components/dist/cjs/flooding-surface"
import {LithologyColumn, GeneralizedSectionColumn} from "@macrostrat/column-components/dist/cjs/lithology"
import {Popover, Position} from "@blueprintjs/core"
import {SequenceStratContext} from "../sequence-strat-context"
import {ColumnProvider, ColumnContext} from '@macrostrat/column-components'
import {SimplifiedLithologyColumn, CoveredOverlay, FaciesColumnInner,
        LithologyColumnInner, SimpleFrame} from '@macrostrat/column-components/dist/cjs/lithology'
import {DivisionEditOverlay} from '@macrostrat/column-components/dist/cjs/edit-overlay'

import {ColumnTracker} from '../components/link-overlay'
import {
  ColumnSurfacesProvider,
  ColumnSurfacesContext
} from '../column/data-source'
import {PlatformContext} from "../../platform"
import {IntervalEditor} from "../editor"
import {Notification} from "../../notify"
import {FaciesContext} from "../facies"
import {MinimalIsotopesColumn} from './chemostrat'
import {FaciesTractIntervals} from '../column/facies-tracts'

import {hyperStyled} from "@macrostrat/hyper"
import styles from "./main.styl"
h = hyperStyled(styles)


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
  {showFacies, showFaciesTracts, showLithology, showGrainsize} = useSettings()
  c = GeneralizedSectionColumn
  width = null
  if not showGrainsize
    c = LithologyColumn
    width = 60

  h c, {width}, [
    h.if(showFacies) FaciesColumnInner
    h.if(showFaciesTracts) FaciesTractIntervals
    h CoveredOverlay
    h.if(showLithology) SimplifiedLithologyColumn
  ]

EditOverlay = (props)->
  {interactive} = useSettings()
  interactive ?= false
  return null unless interactive
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
  {height, zoom, scale, pixelsPerMeter} = useContext(ColumnContext)
  ratio = pixelsPerMeter*zoom

  # Keep labels from inhabiting the top few pixels (to make space for section labels)
  topPadding = 30
  maxVal = scale.domain()[1]-topPadding/ratio

  h ColumnAxis, {
    ticks: (height*zoom)/5
    showLabel: (d)-> d < maxVal
  }

ColumnIsotopes = (props)->
  opts = useSettings()
  {id, columnWidth} = props
  columnWidth ?= 40
  return null unless opts.isotopesPerSection
  h [
    h.if(opts.showCarbonIsotopes) MinimalIsotopesColumn, {
      width: columnWidth,
      section: id
      transform: 'translate(120)'
    }
    h.if(opts.showOxygenIsotopes) MinimalIsotopesColumn, {
      width: columnWidth,
      section: id
      transform: 'translate(160)'
      system: 'delta18o'
    }
  ]

SequenceStratViews = (props)->
  {id} = props
  {sequenceStratOrder, showFloodingSurfaces, showTriangleBars} = useSettings()
  h [
    h.if(showFloodingSurfaces) FloodingSurface, {
      offsetLeft: -40
      lineWidth: 30
    }
    h.if(showTriangleBars) TriangleBars, {
      id
      offsetLeft: 0
      lineWidth: 20
      orders: [
        sequenceStratOrder,
        sequenceStratOrder-1
      ]
    }
  ]

calcColumnWidth = (props)->
  {baseWidth} = props
  o = useSettings()

  width = baseWidth
  width += 40 # Symbol column

  if o.isotopesPerSection
    if o.showCarbonIsotopes
      width += 40
    if o.showOxygenIsotopes
      width += 40

  if o.showTriangleBars
    width += 40

  return width

ColumnUnderlay = (props)->
  {width, paddingLeft} = props
  {pixelHeight} = useContext(ColumnContext)
  paddingLeft ?= 5
  h 'rect.underlay', {
    width
    height: pixelHeight+10
    x: -paddingLeft
    y: -5
    fill: 'white'
  }

SVGSectionInner = (props)->
  {id, zoom, padding, lithologyWidth,
   innerWidth, onResize, marginLeft,
   showFacies
   showTriangleBars,
   showFloodingSurfaces,
   showWhiteUnderlay,
   inEditMode
   height
   range,
   offsetTop,
   marginTop,
   absolutePosition
   children
   } = props

  innerHeight = height*zoom

  {left, top, right, bottom} = padding

  outerHeight = innerHeight+(top+bottom)
  outerWidth = innerWidth+(left+right)

  {divisions} = useContext(ColumnSurfacesContext)
  divisions = divisions.filter (d)->not d.schematic

  overhangLeft = 0
  overhangRight = 0


  {triangleBarsOffset: tbo, triangleBarRightSide: onRight} = props
  marginLeft -= tbo
  marginRight = 0
  outerWidth += tbo

  if showTriangleBars
    offsetLeft = -tbo+35
    if onRight
      overhangRight = 45
      offsetLeft *= -1
      offsetLeft += tbo+20
    else
      overhangLeft = 25

  # Expand SVG past bounds of section

  domID = "column-#{id}"

  # We need to change this!
  overallWidth = calcColumnWidth {baseWidth: 120}

  grainsizeScaleStart = 40

  h ColumnProvider, {
    range
    height: props.height
    zoom: 0.1
    divisions
  }, [
    h ColumnBox, {
      className: 'section-container'
      offsetTop
      width: overallWidth
      marginLeft: -overhangLeft
      marginRight: -overhangRight
      absolutePosition
    }, [
      h 'div.section-header', [
        h("h2", {style: {zIndex: 20}}, id)
      ]
      h ColumnTracker, {
        className: 'section-outer', id,
        paddingTop: 10
      }, [
        h GrainsizeLayoutProvider, {
          width: innerWidth,
          grainsizeScaleStart
        }, [
          h EditOverlay, {
            id,
            allowEditing: true
            left,
            top: padding.top
          }
          h ColumnSVG, {
            width: overallWidth
            paddingTop: padding.top
            paddingBottom: padding.bottom
            paddingLeft: padding.left
          }, [
            h.if(showWhiteUnderlay) ColumnUnderlay, {
              width: overallWidth
              paddingLeft: left
            }
            h ColumnSummaryAxis
            h ColumnMain
            h ManagedSymbolColumn, {
              left: 90
              id
            }
            h SequenceStratViews, {id}
            h ColumnIsotopes, {
              id,
              columnWidth: props.isotopeColumnWidth
            }
          ]
        ]
        children
      ]
    ]
  ]


SVGSectionInner.defaultProps = {
  zoom: 1
  inEditMode: false
  skeletal: false
  isotopeColumnWidth: 40
  offsetTop: null
  marginTop: null
  useRelativePositioning: true
  showTriangleBars: false
  trackVisibility: false
  innerWidth: 100
  height: 100 # Section height in meters
  lithologyWidth: 40
  showWhiteUnderlay: true
  showFacies: true
  absolutePosition: true
  triangleBarsOffset: 0
  triangleBarRightSide: false
  onResize: ->
  marginLeft: -10
  padding: {
    left: 30
    top: 10
    right: 20
    bottom: 28
  }
}

SVGSectionInner.propTypes = {
  #inEditMode: T.bool
  range: T.arrayOf(T.number).isRequired
  absolutePosition: T.bool
  isotopesPerSection: T.bool
  offsetTop: T.number
}


SVGSectionComponent = (props)->
  {id, divisions} = props
  {inEditMode} = useContext(PlatformContext)
  {showTriangleBars,
  showFloodingSurfaces,
  sequenceStratOrder} = useContext(SequenceStratContext)

  h ColumnSurfacesProvider, {id, divisions}, (
    h SVGSectionInner, {
      showTriangleBars, showFloodingSurfaces,
      sequenceStratOrder, inEditMode, props...,
    }
  )

export {SVGSectionComponent, SVGSectionInner}
