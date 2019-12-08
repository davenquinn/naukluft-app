import {hyperStyled} from "@macrostrat/hyper"
import {group} from 'd3-array'
import {GeneralizedSurfacesContext} from '../generalized-sections/data-provider'
import {useContext} from 'react'
import {useCanvasSize} from "../summary-sections/link-overlay"
import {updateSectionE} from './helpers'
import {SequenceCorrelations} from './sequence'
import {RegionalSectionsContainer} from './container'

import "../summary-sections/main.styl"
import styles from '../generalized-sections/main.styl'
import styles2 from './main.styl'
h = hyperStyled({styles...,styles2...})

SectionPane = (props)->
  {surfaces} = useContext(GeneralizedSurfacesContext)
  sz = useCanvasSize()
  surfaceMap = group surfaces, (s)->s.section
  sections = Array.from surfaceMap, ([key,surfaces])->
    surfaces.sort (a,b)->a.bottom-b.bottom
    return {key,surfaces}

  updateSectionE(sections)

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

RegionalSections = (props)->
  h RegionalSectionsContainer, [
    h SectionPane
  ]

export {RegionalSections}
