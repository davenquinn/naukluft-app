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
   offsetTop,
   divisions
   children
   topSurface
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
  topSurface: null
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
