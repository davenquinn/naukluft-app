import {nest} from "d3-collection"
import {max} from "d3-array"
import {hyperStyled} from "@macrostrat/hyper"
import {Component, useContext, createContext} from "react"
import {useSettings, SettingsProvider} from "#"
import {getSectionData} from "../section-data"
import {ChemostratigraphyColumn} from "./chemostrat"
import {SVGSectionComponent} from "./column"
import {SectionNavigationControl} from "../util"
import {
  SectionLinkOverlay,
  SectionPositionProvider
} from "./link-overlay"
import {stackGroups, groupOrder, sectionOffsets} from "./display-parameters"
import {
  SequenceStratConsumer,
  SequenceStratContext
} from "../sequence-strat-context"
import {LithostratKey} from "./lithostrat-key"
import {LocationGroup} from './layout'
import {Legend} from "./legend"
import {SectionPositioner, SectionScale} from "./positioner"
import {BaseSectionPage} from '../components'
import {SummarySectionsSettings, defaultSettings} from './settings'
import {
  SectionSurfacesContext,
  SectionSurfacesProvider
} from './data-provider'
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

  sectionGroups = nest()
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

SectionPane = (props) ->
  {sectionPositions, sections
   groupMargin, columnMargin, columnWidth} = props

  {dragdealer, dragPosition, rest...} = useSettings()
  {surfaces} = useContext(SectionSurfacesContext)

  {showFloodingSurfaces,
   showSequenceStratigraphy,
   showCarbonIsotopes,
   showOxygenIsotopes,
   showFacies,
   showLegend,
   showLithostratigraphy,
   isotopesPerSection
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

  maxOffset = max sections.map (d)->
    parseFloat(d.height)-parseFloat(d.offset)+669

  paddingLeft = if showTriangleBars then 90 else 30

  minHeight = 1500

  options = useSettings()
  showChemostrat = not options.isotopesPerSection

  h 'div#section-pane', {style: {overflow: 'scroll'}}, [
    h "div#section-page-inner", {
      style: {zoom: 1, minHeight}
    }, [
      h SectionLinkOverlay, {
        connectLines: true
        surfaces
      }
      h LithostratKey, {
        zoom: 0.1,
        key: "key",
        surfaces,
        offset
        rest...
      }
      h.if(showChemostrat) ChemostratigraphyColumn, {
        sections
        surfaces
        options
      }
      h "div#section-container", [
        h.if(showLegend) Legend
        h 'div.grouped-sections', groupedSections.map ({location, columns}, i)->
          marginRight = groupMargin
          if i == groupedSections.length-1
            marginRight = 0
          style = {marginRight, height}
          h LocationGroup, {
            key: location,
            location,
            style
          }, columns.map (col, i)->
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

              h SVGSectionComponent, {
                zoom: 0.1,
                key: row.id,
                triangleBarRightSide: row.id == 'J'
                showCarbonIsotopes,
                isotopesPerSection
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
      sectionPositions: {}
    }
    query(lithostratSurface)
      .then (surfaces)=>
        surfaces.reverse()
        @setState {surfaces}

  render: ->
    {settingsPanel} = @props
    h BaseSectionPage, {
      id: @pageID,
      settingsPanel,
      defaultSettings
    }, [
      h SectionPane, {
        @props...,
        @state...
      }
    ]

SummarySections = (props)->
  h SectionSurfacesProvider, [
    h SectionPositionProvider, [
      h SequenceStratConsumer, null, ({actions, rest...})->
        h SummarySectionsBase, {
          props...,
          rest...
        }
    ]
  ]

SummarySectionsStatic = (props)->
  sectionSettings = {}

  h SectionSurfacesProvider, [
    h SectionPositionProvider, [
      h SettingsProvider, {
        sectionSettings...
      }, [
        h 'div.page.section-page', [
          h 'div.panel-container', [
            h SectionPane, {
              props...,
            }
          ]
        ]
      ]
    ]
  ]

export {
  SummarySections,
  SummarySectionsStatic,
  SummarySectionsBase,
}
