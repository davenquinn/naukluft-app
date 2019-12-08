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
import {IsotopesComponent} from "../summary-sections/chemostrat"
import {LithostratKey} from "../summary-sections/lithostrat-key"
import {Legend} from "../summary-sections/legend"
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
import {SequenceCorrelations} from './sequence'
import {writeFileSync} from 'fs'
import path from 'path'

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
