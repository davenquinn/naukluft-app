import {hyperStyled} from "@macrostrat/hyper"
import {group} from 'd3-array'

import {
  GeneralizedSurfacesContext,
  GeneralizedSurfacesProvider
} from '../generalized-sections/data-provider'
import {GeneralizedSectionSettings, defaultSettings} from "../generalized-sections/settings"
import {IsotopesComponent} from "../summary-sections/chemostrat"
import {LithostratKey} from "../summary-sections/lithostrat-key"
import {Legend} from "../summary-sections/legend"
import "../summary-sections/main.styl"
import {useSettings, SettingsProvider} from '#'
import {useContext} from 'react'
import {
  SectionPositionProvider,
  SectionLinkOverlay
  useCanvasSize
} from "../summary-sections/link-overlay"
import {
  SectionSurfacesProvider
  SectionSurfacesContext
} from '../summary-sections/data-provider'
import {SVGSectionComponent} from '../summary-sections/column'
import {FaciesSection} from './column'
import styles from '../generalized-sections/main.styl'
import styles2 from './main.styl'
h = hyperStyled({styles...,styles2...})

getGeneralizedHeight = (sectionData, opts={})->
  # Manage the top and bottom heights allowed
  # using only the first section
  upperHeight = {}
  lowerHeight = {}
  for {key, surfaces} in sectionData
    if opts.topSurface?
      s = surfaces.find (d)->d.surface == opts.topSurface
      upperHeight[key] = s.bottom
    if opts.bottomSurface?
      s = surfaces.find (d)->d.surface == opts.bottomSurface
      lowerHeight[key] = s.bottom

  return (surface)->
    # Gets heights of a surface in stacked sections
    {section, height, inferred} = surface
    for {key, surfaces} in sectionData
      for s in surfaces
        continue unless s.original_section.trim() == section.trim()
        continue unless s.original_bottom == height
        # Make sure we only take links between upper and lower surfaces if set
        continue if upperHeight[key]? and upperHeight[key] < s.bottom
        continue if lowerHeight[key]? and lowerHeight[key] > s.bottom
        return {section: s.section, height: s.bottom, inferred}
    return null

LinkOverlay = (props)->
  {sections, topSurface, bottomSurface, rest...} = props
  {surfaces} = useContext(SectionSurfacesContext)
  generalize = getGeneralizedHeight(sections, {topSurface, bottomSurface})

  surfaces = surfaces.map ({section_height, rest...})->
    # Update surfaces to use generalized section heights
    section_height = section_height.map(generalize).filter (d)->d?
    {section_height, rest...}

  h SectionLinkOverlay, {surfaces, rest...}

CorrelationContainer = (props)->
  {id, sections, children, rest...} = props
  domID = "sequence-#{id}"

  h SectionPositionProvider, [
    h 'div.sequence', {id: domID}, [
      h LinkOverlay, {sections, rest...}
      h 'div.generalized-sections', children
    ]
  ]

SequenceCorrelations = (props)->
  {sections, offsets, id, bottomSurface, topSurface, rest...} = props
  h CorrelationContainer, {
    id,
    sections,
    topSurface,
    bottomSurface
  }, sections.map ({key,surfaces})->
    start = 0
    # Bottom is the first division with an assigned facies
    for d in surfaces
      if d.facies? and d.facies != 'none'
        start = d.bottom
        break
    # Top of the last section is taken as the height
    # at which to clip off errant facies
    end = parseFloat(surfaces[surfaces.length-1].section_end)

    h FaciesSection, {
      id: key
      zoom: 0.05,
      key,
      offsetTop: offsets[key] or 0
      range: [start, end]
      divisions: surfaces
      bottomSurface
      topSurface
      rest...
    }

SectionPane = (props)->
  {surfaces} = useContext(GeneralizedSurfacesContext)
  sz = useCanvasSize()
  surfaceMap = group surfaces, (s)->s.section
  sections = Array.from surfaceMap, ([key,surfaces])->
    surfaces.sort (a,b)->a.bottom-b.bottom
    return {key,surfaces}

  order = ['Onis', 'Ubisis', 'Tsams']
  sections.sort (a,b)->
    order.indexOf(a.key)-order.indexOf(b.key)

  h 'div.section-pane-static', {style: {position: 'relative'}}, [
    h SequenceCorrelations, {
      id: "S3"
      offsets: {
        Onis: 0
        Ubisis: 265
        Tsams: 160
      },
      sections,
      bottomSurface: 15
    }
    h SequenceCorrelations, {
      id: "S2"
      offsets: {
        Onis: 0
        Ubisis: 0
        Tsams: 0
      },
      sections,
      topSurface: 15
      bottomSurface: 1
      # Or 20 if we want the correlating sequence boundary
    }
    h SequenceCorrelations, {
      id: "S1"
      offsets: {
        Onis: 0
        Ubisis: 0
        Tsams: 0
      },
      sections,
      topSurface: 1
    }
  ]

GeneralizedSectionsInner = (props)->
  h SettingsProvider, {
    defaultSettings...
  }, [
    h SectionPane
  ]

RegionalSections = (props)->
  h SectionSurfacesProvider, [
    h GeneralizedSurfacesProvider, [
      h GeneralizedSectionsInner
    ]
  ]

export {RegionalSections}
