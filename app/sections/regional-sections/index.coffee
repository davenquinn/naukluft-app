import h from '@macrostrat/hyper'
import {RegionalSections} from './main'
import {BaseSectionPage} from '../components'

settingsPanel = 'div'
defaultSettings = {}

RegionalSectionsPage = (props)->
  h BaseSectionPage, {
    id: 'regional-sections'
    settingsPanel,
    defaultSettings
  }, [
    h RegionalSections
  ]

export {RegionalSectionsPage}
