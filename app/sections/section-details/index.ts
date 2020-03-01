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
    isEditable: false,
    ...props,
    ...settings,
  });
};

const SectionPanel = (props)=>{
  return h("div.section-panel", [
    h("div.sequence.s1", [
      h(Section, {
        sectionID: "J",
        range: [45, 60]
      }),
      h(Section, {
        sectionID: "B",
        range: [38,52]
      }),
      h(Section, {
        sectionID: "J",
        range: [145,160]
      }),
    ]),
    h("div.bottom-row", [
      h("div.sequence.s2", [
        h(Section, {
          sectionID: "F",
          range: [2,22]
        }),
        h(Section, {
          sectionID: "J",
          range: [298,318]
        }),
        h(Section, {
          sectionID: "J",
          range: [322,342]
        })
      ]),
      h("div.sequence.s3", [
        h(Section, {
          sectionID: "J",
          range: [472,492]
        }),
        h(Section, {
          sectionID: "J",
          range: [642,662]
        })
      ])
    ])
  ])
}

const SectionDetailSettings = C(SettingsProvider, {...defaultSettings})

const Figure = compose(
  PlatformProvider,
  SectionDataProvider,
  SectionDetailSettings,
  SectionPanel
)


export default (el, opts, cb) => render(h(Figure), el, cb);
