import h, {compose, C} from '@macrostrat/hyper'
import {render} from 'react-dom'
import {SettingsProvider, useSettings} from '@macrostrat/column-components';
import {SectionComponent} from "../single-section/column";
import {defaultSettings} from "../single-section/settings";
import {PlatformProvider} from '~/platform';
import {SectionDataProvider, useSection} from '~/sections/data-providers';
import '../single-section/main.styl';
import "../main.styl";

const SectionMain = function(props){
  // Set up routing to jump to a specific height
  const {children} = props;
  const settings = useSettings();

  return h(SectionComponent, {
    ...props,
    isEditable: false,
    ...settings,
    children
  });
};

const SectionDetailSettings = C(SettingsProvider, {...defaultSettings})

const Section = (props)=>{
  const section = useSection("J")
  return h(SectionMain, {offsetTop: 0, ...section})
}

const Figure = compose(
  PlatformProvider,
  SectionDataProvider,
  SectionDetailSettings,
  Section
)


export default (el, opts, cb) => render(h(Figure), el, cb);
