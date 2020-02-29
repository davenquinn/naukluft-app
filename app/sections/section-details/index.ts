import h, {compose, C} from '@macrostrat/hyper'
import {render} from 'react-dom'
import {
  SettingsProvider,
  useSettings
} from '@macrostrat/column-components';
import {SectionComponent} from "./column";
import {defaultSettings} from "../single-section/settings";
import {PlatformProvider} from '~/platform';
import {SectionDataProvider, useSection} from '~/sections/data-providers';
import '../single-section/main.styl';
import "../main.styl";
import "./main.styl"

const Section = function(props){
  const settings = useSettings();
  return h(SectionComponent, {
    sectionID: 'J',
    range: [330,340],
    offsetTop: 0,
    isEditable: false,
    ...settings,
  });
};

const SectionDetailSettings = C(SettingsProvider, {...defaultSettings})

const Figure = compose(
  PlatformProvider,
  SectionDataProvider,
  SectionDetailSettings,
  Section
)


export default (el, opts, cb) => render(h(Figure), el, cb);
