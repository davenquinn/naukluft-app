import {max} from "d3-array"
import {Component, useContext, createContext} from "react"
import {useSettings, SettingsProvider} from "@macrostrat/column-components"
import {SVGSectionComponent} from "../column"
import {
  SectionLinkOverlay,
  SectionPositionProvider
} from "../link-overlay"
import {stackGroups, groupOrder, sectionOffsets} from "./positions"
import {
  SequenceStratConsumer,
  SequenceStratContext
} from "../../sequence-strat-context"
import {LithostratKey} from "../lithostrat-key"
import {LocationGroup} from '../layout'
import {Legend} from "../legend"
import {SectionPositioner, SectionScale} from "../positioner"
import {BaseSectionPage} from '../../components'
import {SummarySectionsSettings, defaultSettings} from '../settings'
import {
  SectionSurfacesContext,
  SectionSurfacesProvider,
  groupSectionData
} from '../data-provider'
import T from 'prop-types'
import styles from "./main.styl"
import {hyperStyled} from "@macrostrat/hyper"
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

SectionPane = (props) ->
  {sectionPositions, sections
   groupMargin, columnMargin, columnWidth} = props
  {surfaces} = useContext(SectionSurfacesContext)

  return null unless sections?
  return null unless sections.length > 0

  row = sections.find (d)->d.id == 'J'
  {offset, location, rest...} = row
  location = null

  groupedSections = groupSectionData(sections, {stackGroups, groupOrder})

  maxOffset = max sections.map (d)->
    parseFloat(d.height)-parseFloat(d.offset)+669

  paddingLeft = 30

  minHeight = 1500

  h 'div.static-section-page', [
    h SectionLinkOverlay, {
      connectLines: true
      surfaces
    }
    h "div.section-container", [
      #h Legend
      h 'div.grouped-sections', groupedSections.map ({location, columns}, i)->
        if i == groupedSections.length-1
          marginRight = 0
        h LocationGroup, {
          key: location,
          location,
        }, columns.map (col, i)->
          marginRight = columnMargin
          if i == columns.length-1
            marginRight = 0
          style = {marginRight, width: columnWidth}
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
              offset
              range
              height
              start
              end
              rest...
            }
    ]
  ]

SectionPane.propTypes = {
  sections: T.arrayOf(T.object).isRequired
  surfaces: T.arrayOf(T.object).isRequired
}

SummarySectionsFigure = (props)->
  sectionSettings = {
    showFacies: true
    groupMargin: 400
    columnMargin: 100
    columnWidth: 150
    interactive: false
    showLegend: true
  }

  h SectionSurfacesProvider, [
    h SectionPositionProvider, [
      h SettingsProvider, {
        sectionSettings...
      }, [
        h SectionPane, {
          props...,
        }
      ]
    ]
  ]

export {SummarySectionsFigure}
