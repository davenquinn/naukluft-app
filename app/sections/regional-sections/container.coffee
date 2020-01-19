import h from "@macrostrat/hyper"
import {GeneralizedDivisionsProvider} from '../generalized-sections/data-provider'
import {defaultSettings} from "../generalized-sections/settings"
import {SettingsProvider} from '@macrostrat/column-components'
import {SectionSurfacesProvider} from '../summary-sections/data-provider'

RegionalSectionsContainer = (props)->
  {children} = props
  h SectionSurfacesProvider, null, (
    h GeneralizedDivisionsProvider, null, (
      h SettingsProvider, {
        defaultSettings...
      }, children
    )
  )

export {RegionalSectionsContainer}
