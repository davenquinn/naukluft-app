import {hyperStyled} from "@macrostrat/hyper"
import {Component, useContext} from "react"
import update from "immutability-helper"
import {debounce} from "underscore"
import * as d3 from "d3"
import {ColumnProvider, useSettings} from "#"
import styles from "../main.styl"
import T from 'prop-types'
import {
  IsotopesColumn
  MinimalIsotopesColumn
} from './carbon-isotopes'
import {rangeForSection} from '../../util'
import {LocationGroup} from '../layout'

h = hyperStyled(styles)

ChemostratigraphyGroup = (props)->
  {range, children} = props
  h LocationGroup, {
    name: null
    className: 'chemostratigraphy'
  }, (
    h ColumnProvider, {
      range
      zoom: 0.1
    }, children
  )

ChemostratigraphyColumn = (props)->
  {sections, surfaces, options, colorScheme, range, showLines} = props
  {correctIsotopeRatios, showCarbonIsotopes, showOxygenIsotopes} = useSettings()

  return null unless showCarbonIsotopes or showOxygenIsotopes

  row = sections.find (d)->d.id == 'J'
  {offset, location, rest...} = row

  h ChemostratigraphyGroup, {
    range: rangeForSection(row)
  }, [
    h.if(showCarbonIsotopes) IsotopesColumn, {
      zoom: 0.1,
      key: 'carbon-isotopes',
      offset
      location: ""
      surfaces
      colorScheme
      corrected: correctIsotopeRatios
      showLines
      rest...
    }
    h.if(showOxygenIsotopes) IsotopesColumn, {
      zoom: 0.1,
      system: 'delta18o'
      label: 'δ¹⁸O'
      domain: [-15,4]
      key: 'oxygen-isotopes',
      colorScheme
      corrected: correctIsotopeRatios
      offset
      location: ""
      surfaces
      showLines
      rest...
    }
  ]

ChemostratigraphyColumn.propTypes = {
  showLines: T.bool
}


export {
  IsotopesColumn
  MinimalIsotopesColumn
  ChemostratigraphyColumn
}
