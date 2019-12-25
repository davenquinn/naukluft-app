import {hyperStyled} from "@macrostrat/hyper"
import {useContext, createRef} from 'react'
import {toBlob} from 'dom-to-image'
import {writeFileSync} from 'fs'

import {
  SectionPositionProvider,
  SectionLinkOverlay
} from "../components/link-overlay"
import {SectionSurfacesContext} from '../summary-sections/data-provider'
import {getGeneralizedHeight, exportSVG} from './helpers'
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

  h SectionLinkOverlay, {className: 'sequence-link-overlay', surfaces, rest...}

filenameForID = (id, ext)->
  return path.join(
    path.resolve("."),
    "sections",
    "regional-sections",
    "sequence-data",
    require.resolve("./#{id}.#{ext}")
  )

CorrelationContainer = (props)->
  {id, sections, children, rest...} = props
  domID = "sequence-#{id}"


  outerRef = (node)->
    return unless node?

    observer = new MutationObserver ->
      overlay = node.querySelector(".sequence-link-overlay")
      return unless overlay?
      {x: rootX, y: rootY} = overlay.getBoundingClientRect()

      sections = node.querySelectorAll(".section")
      return unless sections.length > 0

      g = document.createElementNS("http://www.w3.org/2000/svg", 'g')
      g.setAttribute("class", "sections")

      for section in sections
        s1 = section.querySelector("g.lithology-column")
        {x,y} = section.getBoundingClientRect()
        s1a = s1.cloneNode(true)
        t = "translate(#{x-rootX+5}, #{y-rootY+5})"
        s1a.setAttribute('transform', t)
        # Adobe Illustrator does not support SVG clipping paths.
        #clip = s1a.querySelector("clipPath")
        #clip.parentNode.removeChild(clip)

        #r = s1a.querySelector("use.frame")
        #r.parentNode.removeChild(r)

        console.log(s1a)
        g.appendChild(s1a)

      root = overlay.cloneNode(true)
      root.appendChild(g)

      exportSVG(root, filenameForID(id,"svg"))

    observer.observe(node, {childList: true})

  h SectionPositionProvider, [
    h 'div.sequence', {id: domID, ref: outerRef}, [
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
