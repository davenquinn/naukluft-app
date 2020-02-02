import {hyperStyled} from "@macrostrat/hyper"
import {createRef, useContext, useRef, useLayoutEffect} from "react"
import T from 'prop-types'
import {
  ColumnSVG,
  ColumnBox,
  ColumnProvider,
  ColumnContext
} from '@macrostrat/column-components'
import {
  SectionPositionContext,
  ColumnTracker
} from '../components/link-overlay'
import {
  LithologyColumn,
  FaciesColumnInner,
  CarbonateDivisions
  ParameterIntervals,
} from "@macrostrat/column-components/dist/esm/lithology"
import {useFaciesColors} from './util'
import {FaciesContext} from '@macrostrat/column-components'

import styles from './main.styl'
h = hyperStyled(styles)

FaciesTractIntervals = (props)->
  colorIndex = useFaciesColors()
  h ParameterIntervals, {
    parameter: 'facies_tract'
    fillForInterval: (facies_tract, d)->
      return null unless facies_tract?
      colorIndex[facies_tract]
    props...
  }

SVGSectionInner = (props)->
  {id,
   range,
   zoom
   offsetTop,
   divisions
   children
   topSurface
   bottomSurface
   } = props

  divisions = divisions.filter (d)->not d.schematic

  if bottomSurface?
    {bottom: bottomHeight} = divisions.find (d)->d.surface == bottomSurface
    range[0] = bottomHeight
  if topSurface?
    {bottom: topHeight} = divisions.find (d)->d.surface == topSurface
    range[1] = topHeight
  height = range[1]-range[0]

  divisions = divisions.filter (d)->
    range[0] <= d.top and d.bottom <= range[1]

  # Expand SVG past bounds of section

  domID = "column-#{id}"

  h ColumnProvider, {
    range
    height
    zoom
    divisions
  }, [
    h ColumnBox, {
      offsetTop
      width: 40
      absolutePosition: false
    }, [
      h ColumnTracker, {
        className: 'section-outer',
        id,
        padding: 5
      }, [
        h ColumnSVG, {
          width: 30
          padding: 5
        }, [
          h LithologyColumn, {width: 20}, [
            h FaciesTractIntervals
            #h CarbonateDivisions, {minimumHeight: 2}
          ]
        ]
        children
      ]
    ]
  ]


SVGSectionInner.defaultProps = {
  offsetTop: null
  marginTop: null
  topSurface: null
  bottomSurface: null
}

SVGSectionInner.propTypes = {
  #inEditMode: T.bool
  range: T.arrayOf(T.number).isRequired
  absolutePosition: T.bool
  offsetTop: T.number
}

FaciesSection = (props)->
  {id, divisions} = props

  h 'div.section-column', {className: id}, [
    h SVGSectionInner, {divisions, props...}
  ]

export {FaciesSection}
