import {findDOMNode} from "react-dom"
import {Component, createContext} from "react"
import h from "react-hyperscript"
import {Icon} from "react-fa"
import {select} from "d3-selection"
import PropTypes from "prop-types"
import {join} from "path"
import * as d3 from "d3"
import update from "immutability-helper"
Measure = require('react-measure').default
import {StatefulComponent} from '@macrostrat/ui-components'

import {BaseSectionPage} from '../components/base-page'
import {GeneralizedSectionSettings, defaultSettings} from "./settings"
import {getSectionData} from "../section-data"
import {IsotopesComponent} from "../summary-sections/chemostrat"
import {GeneralizedSVGSection} from "./column"
import {SectionNavigationControl} from "../util"
import {LinkOverlayBase} from "../summary-sections/link-overlay"
import {LithostratKey} from "../summary-sections/lithostrat-key"
import {FaciesDescriptionSmall} from "../facies"
import {Legend} from "../summary-sections/legend"
import "../summary-sections/main.styl"
import {useSettings} from '#'
import {
  stackGroups,
  groupOrder,
  sectionOffsets
} from "../summary-sections/display-parameters"
import {NavLink} from "../../nav"
import {SequenceStratConsumer} from "../sequence-strat-context"
import {GeneralizedSectionPositioner} from "./positioner"
import {query} from "../../db"

import generalizedSectionQuery from '../sql/generalized-section.sql'
import "../main.styl"

GeneralizedSectionPositions = {
  Onis: {x: 0, y: 0}
  Tsams: {x: 15, y: 220}
  Ubisis: {x: 5, y: 290}
}

class LinkOverlay extends Component
  render: ->
    return null
    # {width, height} = @props
    # h 'g#section-link-overlay', [
    #   h 'g.section-links', @prepareData().map @buildLink
    # ]

SectionPane = (props)->
  {dimensions, surfaces, sectionData} = props
  return null unless sectionData?
  options = useSettings()
  {showFacies, showLithology} = options

  positioner = new GeneralizedSectionPositioner {
    pixelsPerMeter: 1.5
    columnWidth: 50
    positions: GeneralizedSectionPositions
    scaleMultipliers: {x: 70}
    margin: 40
    marginHorizontal: 80
  }
  groupedSections = positioner.update(sectionData)

  getGeneralizedHeight = (surface)->
    # Gets heights of surfaces in stacked sections
    {section, height, inferred} = surface
    for newSection in sectionData
      for s in newSection.divisions
        continue unless s.original_section.trim() == section.trim()
        continue unless s.original_bottom == height
        return {section: s.section, height: s.bottom, inferred}
    return null

  surfaces = surfaces.map ({section_height, rest...})->
    # Update section heights to use generalized section heights
    section_height = section_height.map(getGeneralizedHeight).filter (d)->d?
    {section_height, rest...}

  size = do -> {width, height} = groupedSections.position

  links = null
  links = h LinkOverlay, {
    size...,
    surfaces, groupedSections
    showLithostratigraphy: false
    showSequenceStratigraphy: true
  }
  h 'svg#section-pane', {size..., style: size}, [
    links
    h 'g.section-pane-inner', {}, groupedSections.map (row, i)=>
      {columns: [[section]]} = row
      console.log section
      vals = do -> {id, divisions, position} = section
      console.log vals.position
      h GeneralizedSVGSection, {vals..., showFacies, showLithology}
  ]

class GeneralizedSectionsBase extends Component
  @defaultProps: {
    scrollable: true
    settingsPanel: GeneralizedSectionSettings
  }
  pageID: 'generalized-sections'
  constructor: (props)->
    super props
    @state =
      surfaces: []
      dimensions: {
        canvas: {width: 100, height: 100}
      }
      sectionPositions: {}

    query generalizedSectionQuery
      .then (data)=>
        groupedSections = d3.nest()
          .key (d)->d.section
          .entries data

        vals = groupedSections.map ({key: section, values: divisions})->
          start = 0
          # Bottom is the first division with an assigned facies
          for d in divisions
            if d.facies? and d.facies != 'none'
              start = d.bottom
              break
          # Top of the last section is taken as the height
          # at which to clip off errant facies
          end = divisions[divisions.length-1].section_end

          return {
            section
            divisions
            start
            end
            clip_end: end
            height: end-start
            id: section
            location: section
            offset: 0
            range: [start, end]
          }

        @setState {sectionData: vals}

  render: =>
    h BaseSectionPage, {
      id: @pageID,
      settingsPanel: @props.settingsPanel,
      defaultSettings: {
        defaultSettings...
        update: @updateOptions
        exportSVG: @exportSVG
      }
    }, h(SectionPane, {@props..., @state...})

  exportSVG: =>
    el = findDOMNode(@).querySelector("svg#section-pane")
    serializer = new XMLSerializer()
    return unless el?
    svgString = serializer.serializeToString(el)
    fs = require('fs')
    fs.writeFileSync(
      '/Users/Daven/Desktop/exported-generalized-sections.svg',
      svgString, 'utf-8'
    )

GeneralizedSections = (props)->
  h SequenceStratConsumer, null, ({actions, rest...})->
    h GeneralizedSectionsBase, {props..., rest...}


export {GeneralizedSections}
