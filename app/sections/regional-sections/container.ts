/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import h from "@macrostrat/hyper";
import {GeneralizedDivisionsProvider} from '../generalized-sections/data-provider';
import {defaultSettings} from "../generalized-sections/settings";
import {SettingsProvider} from '@macrostrat/column-components';
import {SectionSurfacesProvider} from '../summary-sections/data-provider';

const RegionalSectionsContainer = function(props){
  const {children} = props;
  return h(SectionSurfacesProvider, null, (
    h(GeneralizedDivisionsProvider, null, (
      h(SettingsProvider, {
        ...defaultSettings
      }, children)
    ))
  )
  );
};

export {RegionalSectionsContainer};
