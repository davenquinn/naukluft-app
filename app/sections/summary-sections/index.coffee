import {findDOMNode} from "react-dom"
import {select} from "d3-selection"
import {hyperStyled} from "@macrostrat/hyper"
import {Component, useContext} from "react"
import update from "immutability-helper"
import {debounce} from "underscore"
import * as d3 from "d3"
import {ColumnProvider, useSettings} from "#"
import {getSectionData} from "../section-data"
import {ChemostratigraphyColumn} from "./chemostrat"
import {SVGSectionComponent} from "./column"
import {SectionNavigationControl} from "../util"
import {SectionLinkOverlay} from "./link-overlay"
import {stackGroups, groupOrder, sectionOffsets} from "./display-parameters"
import {SequenceStratConsumer, SequenceStratContext} from "../sequence-strat-context"
import {FaciesDescriptionSmall} from "../facies"
import {LithostratKey} from "./lithostrat-key"
import {LocationGroup} from './layout'
import {Legend} from "./legend"
import {query} from "../../db"
import {SectionPositioner, SectionScale} from "./positioner"
import {BaseSectionPage} from '../components'
import {SummarySectionsSettings, defaultSettings} from './settings'
import lithostratSurface from './sql/lithostratigraphy-surface.sql'
import "../main.styl"
import styles from "./main.styl"
import T from 'prop-types'

h = hyperStyled(styles)

class LegacySectionScale extends SectionScale
  pixelOffset: ->
    (670-@props.height-@props.offset)*@props.pixelsPerMeter

class SectionColumn extends Component
  render: ->
    {style} = @props
    style.position = 'relative'
    style.width ?= 240
    h 'div.section-column', {style}, @props.children

groupSectionData = (sections)->
  stackGroup = (d)=>
    for g in stackGroups
      if g.indexOf(d.id) != -1
        return g
    return d.id

  indexOf = (arr)->(d)->
    arr.indexOf(d)

  __ix = indexOf(stackGroups)

  sectionGroups = d3.nest()
    .key (d)->d.location
    .key stackGroup
    .sortKeys (a,b)->__ix(a)-__ix(b)
    .entries sections

  # Change key names to be more semantic
  for g in sectionGroups
    g.columns = g.values.map (col)->
      return col.values
    delete g.values
    g.location = g.key
    delete g.key

  __ix = indexOf(groupOrder)
  sectionGroups.sort (a,b)->__ix(a.location)-__ix(b.location)
  return sectionGroups

WrappedSectionComponent = (props)->
  h SVGSectionComponent, {props...}

SectionPane = (props) ->
  {dimensions, sectionPositions, surfaces, sections
   groupMargin, columnMargin, columnWidth, scrollable} = props
  scrollable = true

  {dragdealer, dragPosition, rest...} = useSettings()
  {showFloodingSurfaces,
   showSequenceStratigraphy,
   showCarbonIsotopes,
   showOxygenIsotopes,
   showFacies,
   showLegend,
   showLithostratigraphy,
   activeMode} = useSettings()

  {showTriangleBars} = useContext(SequenceStratContext)

  return null unless sections?
  return null unless sections.length > 0

  row = sections.find (d)->d.id == 'J'
  {offset, location, rest...} = row
  location = null

  groupedSections = groupSectionData(sections)

  height = 1800
  # Pre-compute section positions
  if showTriangleBars
    columnWidth += 25

  ## Create a section positioner
  positioner = new SectionPositioner({
    groupMargin,
    columnMargin,
    columnWidth,
    sectionOffsets
    ScaleCreator: LegacySectionScale
  })

  groupedSections = positioner.update(groupedSections)

  maxOffset = d3.max sections.map (d)->parseFloat(d.height)-parseFloat(d.offset)+669

  paddingLeft = if showTriangleBars then 90 else 30
  marginTop = 52 # This is a weird hack
  {canvas} = dimensions

  minHeight = 1500

  options = useSettings()

  h 'div#section-pane', {style: {overflow: 'scroll'}}, [
    h "div#section-page-inner", {
      style: {zoom: 1, minHeight}
    }, [
      h LithostratKey, {
        zoom: 0.1,
        key: "key",
        surfaces,
        offset
        rest...
      }
      h ChemostratigraphyColumn, {
        sections
        surfaces
        options
        showCarbonIsotopes
        showOxygenIsotopes
      }
      h "div#section-container", [
        h.if(showLegend) Legend
        h SectionLinkOverlay, {
          paddingLeft,
          connectLines: true
          width: 2500,
          height,
          marginTop,
          groupedSections,
          showLithostratigraphy
          showSequenceStratigraphy
          showCarbonIsotopes
          triangleBarsOffset: 0
          surfaces
        }
        h 'div.grouped-sections', groupedSections.map ({location, columns}, i)->
          marginRight = groupMargin
          if i == groupedSections.length-1
            marginRight = 0
          style = {marginRight, height}
          h LocationGroup, {key: location, location, style}, columns.map (col, i)->
            marginRight = columnMargin
            if i == columns.length-1
              marginRight = 0
            style = {marginRight, height, width: columnWidth}
            h SectionColumn, {key: i, style}, col.map (row)=>
              {offset, range, height, start, end, rest...} = row
              offset = sectionOffsets[row.id] or offset

              # Clip off the top of some columns...
              end = row.clip_end

              height = end-start
              range = [start, end]

              h WrappedSectionComponent, {
                zoom: 0.1,
                key: row.id,
                triangleBarRightSide: row.id == 'J'
                showCarbonIsotopes,
                trackVisibility: false
                offset
                range
                height
                start
                end
                rest...
              }
      ]
    ]
  ]

SectionPane.propTypes = {
  sections: T.arrayOf(T.object).isRequired
  surfaces: T.arrayOf(T.object).isRequired
}

class SummarySectionsBase extends Component
  @defaultProps: {
    scrollable: true
    groupMargin: 400
    columnMargin: 100
    columnWidth: 150
    showNavigationController: true
    settingsPanel: SummarySectionsSettings
  }
  pageID: 'summary-sections'
  constructor: (props)->
    super props
    @state = {
      surfaces: []
      dimensions: {
        canvas: {width: 100, height: 100}
      }
      sectionPositions: {}
    }

    query(lithostratSurface)
      .then (surfaces)=>
        surfaces.reverse()
        @setState {surfaces}

  render: ->
    h BaseSectionPage, {id: @pageID, settingsPanel: @props.settingsPanel, defaultSettings}, [
      h SectionPane, {@props...,@state...}
    ]

SummarySections = (props)->
  h SequenceStratConsumer, null, ({actions, rest...})->
    h SummarySectionsBase, {props..., rest...}

SummarySectionsStatic = (props)->
  h SequenceStratConsumer, null, ({actions, rest...})->
    h SummarySectionsBase, {props..., rest..., showNavigationController: false}

export {
  SummarySections,
  SummarySectionsStatic,
  SummarySectionsBase,
}
