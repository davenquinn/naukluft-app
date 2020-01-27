import {hyperStyled} from "@macrostrat/hyper"
import {Component, useContext, createContext} from "react"
import {useSettings, SettingsProvider} from "@macrostrat/column-components"
import {getSectionData} from "../data-providers"
import {ChemostratigraphyColumn} from "./chemostrat"
import {SVGSectionComponent} from "./column"
import {SectionNavigationControl} from "../util"
import {SectionDataContext} from '../data-providers'
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
import {ArrangedSections} from "./layout"
import {Legend} from "./legend"
import {BaseSectionPage} from '../components'
import {SummarySectionsSettings, defaultSettings} from './settings'
import {
  SectionSurfacesContext,
  SectionSurfacesProvider,
} from './data-provider'
import "../main.styl"
import styles from "./main.styl"
import T from 'prop-types'

h = hyperStyled(styles)

SectionContainer = (props)->
  {children, minHeight} = props
  h SectionPositionProvider, [
    h "div#section-page-inner", {
      style: {zoom: 1, minHeight}
    }, children
  ]

SectionPane = (props) ->
  {sections
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

  # Pre-compute section positions
  if showTriangleBars
    columnWidth += 25

  paddingLeft = if showTriangleBars then 90 else 30

  options = useSettings()
  showChemostrat = not options.isotopesPerSection

  h 'div#section-pane', {style: {overflow: 'scroll'}}, [
    h SectionContainer, [
      h SectionLinkOverlay, {
        connectLines: false
        surfaces
      }
      h LithostratKey, {
        zoom: 0.1,
        key: "key",
        offset
      }
      h.if(showChemostrat) ChemostratigraphyColumn, {
        sections
        surfaces
        showLines: false
        options
      }
      h "div#section-container", [
        h.if(showLegend) Legend
        h ArrangedSections, {
          sections
          groupMargin,
          columnMargin,
          columnWidth
          tightenSpacing
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
  h SectionPositionProvider, [
    h SequenceStratConsumer, null, ({actions, rest...})->
      h SummarySectionsBase, {
        props...,
        rest...
      }
  ]

SummarySectionsStatic = (props)->
  sectionSettings = {
    showFacies: true
  }

  sections = useContext(SectionDataContext)

  h SectionSurfacesProvider, [
    h SectionPositionProvider, [
      h SettingsProvider, {
        sectionSettings...

      }, [
        h 'div.page.section-page', [
          h 'div.panel-container', [
            h SectionPane, {
              groupMargin: 400
              columnMargin: 100
              columnWidth: 150
              sections
              props...,
            }
          ]
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
