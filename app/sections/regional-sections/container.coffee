import h from "@macrostrat/hyper"
import {GeneralizedSurfacesProvider} from '../generalized-sections/data-provider'
import {defaultSettings} from "../generalized-sections/settings"
import {SettingsProvider} from '#'
import {SectionSurfacesProvider} from '../summary-sections/data-provider'

RegionalSectionsContainer = (props)->
  {children} = props
  h SectionSurfacesProvider, null, (
    h GeneralizedSurfacesProvider, null, (
      h SettingsProvider, {
        defaultSettings...
      }, children
    )
  )

export {RegionalSectionsContainer}
