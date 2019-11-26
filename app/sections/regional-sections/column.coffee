import {hyperStyled} from "@macrostrat/hyper"
import {SVGSectionComponent} from '../summary-sections/column'
import {useContext} from 'react'
import {
  ColumnSurfacesProvider,
} from '../column/data-source'

import styles from './main.styl'
h = hyperStyled(styles)

import {Component, createElement, createRef} from "react"
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
import {
  LithologyColumn,
  CarbonateDivisions,
  GeneralizedSectionColumn
} from "#/lithology"
import {Popover, Position} from "@blueprintjs/core"
import {SequenceStratContext} from "../sequence-strat-context"
import {ColumnProvider, ColumnContext} from '#/context'
import {SimplifiedLithologyColumn, CoveredOverlay, FaciesColumnInner,
        LithologyColumnInner, SimpleFrame} from '#/lithology'
import {DivisionEditOverlay} from '#/edit-overlay'

import {ColumnTracker} from '../summary-sections/link-overlay'
import {
  ColumnSurfacesContext
} from '../column/data-source'
import {PlatformContext} from "../../platform"
import {IntervalEditor} from "../editor"
import {Notification} from "../../notify"
import {FaciesContext} from "../facies"
import {MinimalIsotopesColumn} from '../summary-sections/chemostrat'
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

ColumnBox = (props)->
  {offsetTop, absolutePosition, rest...} = props
  {pixelsPerMeter, zoom} = useContext(ColumnContext)

  marginTop = offsetTop*pixelsPerMeter*zoom
  pos = {marginTop}
  if absolutePosition
    pos = {
      position: 'absolute'
      top: marginTop
    }

  h Box, {
    className: 'section-container'
    pos...
    rest...
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

  # Expand SVG past bounds of section

  domID = "column-#{id}"

  # We need to change this!
  overallWidth = calcColumnWidth {baseWidth: 120}

  grainsizeScaleStart = 40

  h ColumnProvider, {
    range
    height: props.height
    zoom: 0.05
    divisions
  }, [
    h ColumnBox, {
      offsetTop
      width: 70
      absolutePosition: false
    }, [
      h 'div.section-outer', {id: domID}, [
        h ColumnTracker, {
          domID,
          id,
          width: 50,
          padding: 10
        }
        h ColumnSVG, {
          width: 70
          paddingTop: 10
          paddingBottom: 10
          paddingLeft: 10
        }, [
          h LithologyColumn, {width: 50}, [
            h FaciesColumnInner
            #h FaciesTractIntervals
            h CarbonateDivisions, {minimumHeight: 1}
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

FaciesSection = (props)->
  {id} = props
  {id, divisions} = props

  h 'div.section-column', {className: id}, [
    h ColumnSurfacesProvider, {id, divisions}, (
      h SVGSectionInner, {inEditMode: false, props...,
      }
    )
  ]

export {FaciesSection}
