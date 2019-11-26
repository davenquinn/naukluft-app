import {hyperStyled} from "@macrostrat/hyper"
import {createRef} from "react"
import T from 'prop-types'
import {ColumnSVG, ColumnBox, ColumnProvider} from '#'
import {
  LithologyColumn,
  FaciesColumnInner,
  CarbonateDivisions,
} from "#/lithology"
import {ColumnTracker} from '../summary-sections/link-overlay'

import styles from './main.styl'
h = hyperStyled(styles)

# Surface 15

SVGSectionInner = (props)->
  {id,
   height
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
