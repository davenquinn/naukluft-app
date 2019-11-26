import {hyperStyled} from "@macrostrat/hyper"
import {useContext} from 'react'

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

import {GrainsizeLayoutProvider, ColumnSVG, ColumnBox} from '#'
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

# Surface 15

SVGSectionInner = (props)->
  {id,
   height
   range,
   offsetTop,
   divisions
   children
   } = props

  divisions = divisions.filter (d)->not d.schematic

  # Expand SVG past bounds of section

  domID = "column-#{id}"

  h ColumnProvider, {
    range
    height
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
  offsetTop: null
  marginTop: null
}

SVGSectionInner.propTypes = {
  #inEditMode: T.bool
  range: T.arrayOf(T.number).isRequired
  absolutePosition: T.bool
  offsetTop: T.number
}

FaciesSection = (props)->
  {id} = props
  {id, divisions} = props

  h 'div.section-column', {className: id}, [
    h SVGSectionInner, {divisions, props...}
  ]

export {FaciesSection}
