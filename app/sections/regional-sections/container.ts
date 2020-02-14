import h, {compose} from "@macrostrat/hyper";
import {
  GeneralizedDivisionsProvider,
  GeneralizedSurfacesProvider
} from '../generalized-sections/data-provider';
import {SettingsProvider} from "../summary-sections/settings";

const RegionalSectionsContainer = compose(
  GeneralizedDivisionsProvider,
  GeneralizedSurfacesProvider,
  SettingsProvider
)

export {RegionalSectionsContainer};
