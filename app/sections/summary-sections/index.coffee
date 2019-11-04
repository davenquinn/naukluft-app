import {findDOMNode} from "react-dom"
import {select} from "d3-selection"
import {hyperStyled} from "@macrostrat/hyper"
import {Component, createContext, createRef} from "react"
import {HotkeysTarget, Hotkeys, Hotkey} from "@blueprintjs/core"
import update from "immutability-helper"
import PropTypes from "prop-types"
import {debounce} from "underscore"
import * as d3 from "d3"
import {ColumnProvider} from "#"
import {SummarySectionsSettings} from "./settings"
import LocalStorage from "../storage"
import {getSectionData} from "../section-data"
import {IsotopesColumn} from "./carbon-isotopes"
import {SVGSectionComponent} from "./column"
import {SectionNavigationControl} from "../util"
import {SectionLinkOverlay} from "./link-overlay"
import {stackGroups, groupOrder, sectionOffsets} from "./display-parameters"
import {SectionOptionsContext, SectionOptionsProvider, defaultSectionOptions} from "./options"
import {SequenceStratConsumer} from "../sequence-strat-context"
import {FaciesDescriptionSmall} from "../facies"
import {LithostratKey} from "./lithostrat-key"
import {Legend} from "./legend"
import {query} from "../../db"
import {SectionPositioner, SectionScale} from "./positioner"
import lithostratSurface from './sql/lithostratigraphy-surface.sql'
import "../main.styl"
import styles from "./main.styl"

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

class LocationGroup extends Component
  @defaultProps: {
    offsetTop: 0
  }
  render: ->
    {id, name, location, width,
     children, style, className} = @props
    name ?= location
    id ?= location
    style ?= {}
    style.width ?= width
    h 'div.location-group', {id, style, className}, [
      h 'h1', {}, name
      h 'div.location-group-body', {}, children
    ]

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
  h SectionOptionsContext.Consumer, null, (opts)=>
    h SVGSectionComponent, {opts..., props...}

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

rangeForSection = (row)->
  {start, end, clip_end} = row
  clip_end ?= end
  [start, clip_end]

ChemostratigraphyColumn = (props)->
  {sections, surfaces, options, range} = props
  {showCarbonIsotopes, showOxygenIsotopes} = options
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
      rest...
    }
    h.if(showOxygenIsotopes) IsotopesColumn, {
      zoom: 0.1,
      system: 'delta18o'
      label: 'δ¹⁸O'
      domain: [-15,4]
      key: 'oxygen-isotopes',
      offset
      location: ""
      surfaces
      rest...
    }
  ]

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
      sections: []
      surfaces: []
      dimensions: {
        canvas: {width: 100, height: 100}
      }
      sectionPositions: {}
      options: {
        settingsPanelIsActive: false
        modes: [
          {value: 'normal', label: 'Normal'}
          {value: 'skeleton', label: 'Skeleton'}
        ]
        showNavigationController: true
        activeMode: 'normal'
        defaultSectionOptions...
        showLegend: true
        # Allows us to test the serialized query mode
        # we are developing for the web
        serializedQueries: global.SERIALIZED_QUERIES
        condensedDisplay: true
        update: @updateOptions
        sectionIDs: []
        showLithostratigraphy: true
        showSequenceStratigraphy: true
        showCarbonIsotopes: true
        chemostratigraphyPerSection: false
      }
    }

    @optionsStorage = new LocalStorage 'summary-sections'
    v = @optionsStorage.get()
    return unless v?
    @state = update @state, options: {$merge: v}

    query(lithostratSurface)
      .then (surfaces)=>
        surfaces.reverse()
        console.log surfaces
        @setState {surfaces}

  renderSections: ->
    {sections, scrollable, showTriangleBars} = @props
    {dimensions, options, sectionPositions, surfaces} = @state
    {dragdealer, dragPosition, rest...} = options
    {showFloodingSurfaces,
     showSequenceStratigraphy,
     showCarbonIsotopes,
     showOxygenIsotopes,
     showFacies,
     showLegend,
     showLithostratigraphy,
     activeMode} = options

    return null unless sections?
    return null unless sections.length > 0

    row = sections.find (d)->d.id == 'J'
    {offset, location, rest...} = row
    location = null

    groupedSections = groupSectionData(sections)

    height = 1800
    # Pre-compute section positions
    {groupMargin, columnMargin, columnWidth} = @props
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
    overflow = if scrollable then "scroll" else 'inherit'
    {canvas} = @state.dimensions

    minHeight = 1500

    h 'div#section-pane', {style: {overflow}}, [
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

  render: ->
    # Keep errors isolated within groups
    sections = null
    try
      sections = @renderSections()
    catch err
      console.error err

    h 'div.page.section-page', {id: @pageID}, [
      h 'div.panel-container', [
        h SectionOptionsProvider, {
          @state.options...,
          triangleBarsOffset: if @props.showTriangleBars then 80 else 0
        }, [
          h.if(@props.showNavigationController) SectionNavigationControl, {
            backLocation: '/section',
            @toggleSettings
          }
          sections
        ]
      ]
      h @props.settingsPanel, {@state.options...}
    ]

  updateOptions: (opts)=>
    newOptions = update @state.options, opts
    @setState options: newOptions
    @optionsStorage.set newOptions

  toggleSettings: =>
    @updateOptions settingsPanelIsActive: {$apply: (d)->not d}

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
  SectionOptionsContext
}
