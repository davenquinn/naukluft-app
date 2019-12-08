import {hyperStyled} from "@macrostrat/hyper"
import {group} from 'd3-array'
import {
  GeneralizedSurfacesContext,
  GeneralizedSurfacesProvider
} from '../generalized-sections/data-provider'
import {
  GeneralizedSectionSettings,
  defaultSettings
} from "../generalized-sections/settings"
import {useSettings, SettingsProvider} from '#'
import {
  useContext,
  forwardRef,
  useEffect,
  useLayoutEffect,
  useRef
} from 'react'
import {
  SectionPositionProvider,
  SectionLinkOverlay
  useCanvasSize
} from "../summary-sections/link-overlay"
import {
  SectionSurfacesProvider
  SectionSurfacesContext
} from '../summary-sections/data-provider'
import {
  updateSectionE,
  getGeneralizedHeight,
  exportSVG
} from './helpers'
import {SVGSectionComponent} from '../summary-sections/column'
import {FaciesSection} from './column'
import path from 'path'

import styles from './main.styl'
h = hyperStyled(styles)

LinkOverlay = (props)->
  {sections, topSurface, bottomSurface, rest...} = props
  {surfaces} = useContext(SectionSurfacesContext)
  generalize = getGeneralizedHeight(sections, {topSurface, bottomSurface})

  surfaces = surfaces.map ({section_height, rest1...})->
    # Update surfaces to use generalized section heights
    section_height = section_height.map(generalize).filter (d)->d?
    {section_height, rest1...}

  h SectionLinkOverlay, {surfaces, rest...}

CorrelationContainer = (props)->
  {id, sections, children, rest...} = props
  domID = "sequence-#{id}"


  innerRef = (node)->
    exportFilename = path.join(
      path.resolve("."), "sections",
      "regional-sections", require.resolve("./#{id}.svg"))
    return unless node?
    console.log "Exporting file #{id}.svg", node
    exportSVG(node, exportFilename)

  #useEffect exportCorrelations

  h SectionPositionProvider, [
    h 'div.sequence', {id: domID}, [
      h LinkOverlay, {innerRef, sections, rest...}
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
    end = surfaces[surfaces.length-1].top

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

export {SequenceCorrelations}
