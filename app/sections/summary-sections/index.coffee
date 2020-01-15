import {hyperStyled} from "@macrostrat/hyper"
import {Component, useContext, createContext} from "react"
import {useSettings, SettingsProvider} from "@macrostrat/column-components"
import {getSectionData} from "../section-data"
import {ChemostratigraphyColumn} from "./chemostrat"
import {SVGSectionComponent} from "./column"
import {SectionNavigationControl} from "../util"
import {
  SectionLinkOverlay,
  SectionPositionProvider
} from "../components/link-overlay"
import {
  groupOrder,
  stackGroups,
  sectionOffsets
  groupOffsets
  sectionIsotopeScheme
} from "./display-parameters"
import {
  SequenceStratConsumer,
  SequenceStratContext
} from "../sequence-strat-context"
import {LithostratKey} from "./lithostrat-key"
import {LocationGroup} from './layout'
import {Legend} from "./legend"
import {BaseSectionPage} from '../components'
import {SummarySectionsSettings, defaultSettings} from './settings'
import {
  SectionSurfacesContext,
  SectionSurfacesProvider,
  groupSectionData
} from './data-provider'
import "../main.styl"
import styles from "./main.styl"
import T from 'prop-types'

h = hyperStyled(styles)

class SectionColumn extends Component
  render: ->
    {style} = @props
    style.position = 'relative'
    style.width ?= 240
    h 'div.section-column', {style}, @props.children

SectionContainer = (props)->
  {children, minHeight} = props
  h SectionPositionProvider, [
    h "div#section-page-inner", {
      style: {zoom: 1, minHeight}
    }, children
  ]

SectionPane = (props) ->
  {sectionPositions, sections
   groupMargin,
   columnMargin,
   columnWidth,
   tightenSpacing
   } = props

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

  groupedSections = groupSectionData(sections, {stackGroups, groupOrder})

  height = 1800
  # Pre-compute section positions
  if showTriangleBars
    columnWidth += 25

  paddingLeft = if showTriangleBars then 90 else 30

  minHeight = 1500

  options = useSettings()
  showChemostrat = not options.isotopesPerSection

  h 'div#section-pane', {style: {overflow: 'scroll'}}, [
    h SectionContainer, [
      h SectionLinkOverlay, {
        connectLines: false
        surfaces
      }
      # h LithostratKey, {
      #   zoom: 0.1,
      #   key: "key",
      #   surfaces,
      #   offset
      #   rest...
      # }
      h.if(showChemostrat) ChemostratigraphyColumn, {
        sections
        surfaces
        showLines: false
        options
      }
      h "div#section-container", [
        h.if(showLegend) Legend
        h 'div.grouped-sections', groupedSections.map ({location, columns}, i)->
          marginRight = groupMargin
          if location == 'Tsams'
            marginRight = 0
          # Tighten spacing for Onis and Naukluft
          if tightenSpacing
            if i == 0
              marginRight /= 2.5
            if i == 1
              marginRight = 30

          style = {marginRight, height}

          if location == 'Büllsport'
            style = {position: 'absolute', top: 0, right: 0}

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
              {offset, start, clip_end: end, id} = row
              offset = sectionOffsets[id] or offset

              # Clip off the top of some columns...

              height = end-start
              range = [start, end]

              h SVGSectionComponent, {
                zoom: 0.1,
                key: id,
                triangleBarRightSide: id == 'J'
                showCarbonIsotopes,
                isotopesPerSection
                offsetTop: (670-height-offset)
                range
                height
                start
                end
                id
              }
      ]
    ]
  ]

SectionPane.defaultProps = {
  tightenSpacing: true
}

SectionPane.propTypes = {
  sections: T.arrayOf(T.object).isRequired
  surfaces: T.arrayOf(T.object).isRequired
  tightenSpacing: T.bool
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
  sectionSettings = {
    showFacies: true
  }

  h SectionSurfacesProvider, [
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

export {
  SummarySections,
  SummarySectionsStatic,
  SummarySectionsBase,
  SectionPane
}
