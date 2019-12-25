import {hyperStyled} from "@macrostrat/hyper"
import {useContext, createRef} from 'react'

import {
  SectionPositionProvider,
  SectionLinkOverlay
} from "../components/link-overlay"
import {SectionSurfacesContext} from '../summary-sections/data-provider'
import {getGeneralizedHeight, exportSVG} from './helpers'
import {FaciesSection} from './column'
import {exportSequence} from './svg-export'
import {CrossSectionUnits} from './section-units'

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

  h SectionLinkOverlay, {className: 'sequence-link-overlay', surfaces, rest...}

CorrelationContainer = (props)->
  {id, sections, children, rest...} = props
  domID = "sequence-#{id}"

  outerRef = (node)->
    return unless node?
    observer = new MutationObserver exportSequence(id, node)
    observer.observe(node, {childList: true})

  hideLinks = true
  style = null
  if hideLinks
    style = {opacity: 0.2}

  h SectionPositionProvider, [
    h 'div.sequence', {id: domID, ref: outerRef}, [
      h LinkOverlay, {sections, style, rest...}
      h CrossSectionUnits, {id, style: {position: 'absolute', top: 0}}
      h 'div.generalized-sections', children
    ]
  ]


SequenceCorrelations = (props)->
  {sections, offsets, id, bottomSurface, topSurface, rest...} = props
  h CorrelationContainer, {
    id,
    sections,
    topSurface,
    bottomSurface,
    width: 1200
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
