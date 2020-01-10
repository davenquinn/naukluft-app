import {hyperStyled} from "@macrostrat/hyper"
import {group} from 'd3-array'

import {BaseSectionPage} from '../components/base-page'
import {
  GeneralizedSurfacesContext,
  GeneralizedSurfacesProvider
} from './data-provider'
import {GeneralizedSectionSettings, defaultSettings} from "./settings"
import {IsotopesComponent} from "../summary-sections/chemostrat"
import {LithostratKey} from "../summary-sections/lithostrat-key"
import {Legend} from "../summary-sections/legend"
import "../summary-sections/main.styl"
import {useSettings} from '@macrostrat/column-components'
import {useContext} from 'react'
import {
  SectionPositionProvider,
  SectionLinkOverlay
} from "../components/link-overlay"
import {
  SectionSurfacesProvider
  SectionSurfacesContext
} from '../summary-sections/data-provider'
import {SVGSectionComponent} from '../summary-sections/column'
import styles from './main.styl'
h = hyperStyled(styles)

GeneralizedSection = (props)->
  {id} = props
  h 'div.section-column', {className: id}, [
    h SVGSectionComponent, {
      props...
      absolutePosition: false
    }
  ]

getGeneralizedHeight = (sectionData)->(surface)->
  # Gets heights of a surface in stacked sections
  {section, height, inferred} = surface
  for {key, surfaces} in sectionData
    for s in surfaces
      continue unless s.original_section.trim() == section.trim()
      continue unless s.original_bottom == height
      return {section: s.section, height: s.bottom, inferred}
  return null

LinkOverlay = (props)->
  {sections} = props
  {surfaces} = useContext(SectionSurfacesContext)
  generalize = getGeneralizedHeight(sections)

  surfaces = surfaces.map ({section_height, rest...})->
    # Update surfaces to use generalized section heights
    section_height = section_height.map(generalize).filter (d)->d?
    {section_height, rest...}

  h SectionLinkOverlay, {surfaces}


SectionPane = (props)->
  {surfaces} = useContext(GeneralizedSurfacesContext)
  surfaceMap = group surfaces, (s)->s.section
  sections = Array.from surfaceMap, ([key,surfaces])->
    surfaces.sort (a,b)->a.bottom-b.bottom
    return {key,surfaces}

  order = ['Onis', 'Ubisis', 'Tsams']
  sections.sort (a,b)->
    order.indexOf(a.key)-order.indexOf(b.key)

  offsets = {
    Onis: 0
    Ubisis: 300
    Tsams: 200
  }

  h 'div#section-pane', {style: {overflow: 'scroll'}}, [
    h "div#section-page-inner", [
      h LinkOverlay, {sections}
      h 'div.generalized-sections', sections.map ({key,surfaces})->
        start = 0
        # Bottom is the first division with an assigned facies
        for d in surfaces
          if d.facies? and d.facies != 'none'
            start = d.bottom
            break
        # Top of the last section is taken as the height
        # at which to clip off errant facies
        end = parseFloat(surfaces[surfaces.length-1].section_end)

        h GeneralizedSection, {
          id: key
          zoom: 0.1,
          key,
          triangleBarRightSide: key == 'Onis'
          offsetTop: offsets[key]
          start
          end
          range: [start, end]
          height: end-start
          divisions: surfaces
        }
    ]
  ]


GeneralizedSectionsInner = (props)->
  h BaseSectionPage, {
    id: 'generalized-sections'
    settingsPanel: GeneralizedSectionSettings
    defaultSettings
  }, [
    h SectionPane
  ]

GeneralizedSections = (props)->
  h SectionSurfacesProvider, [
    h GeneralizedSurfacesProvider, [
      h SectionPositionProvider, [
        h GeneralizedSectionsInner
      ]
    ]
  ]

export {GeneralizedSections}
