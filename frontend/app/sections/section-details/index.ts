import h, { compose, C } from "@macrostrat/hyper";
import { render } from "react-dom";
import { SettingsProvider, useSettings } from "@macrostrat/column-components";
import { SectionComponent } from "./column";
import { defaultSettings } from "../single-section/settings";
import { PlatformProvider } from "~/platform";
import { SectionDataProvider, useSection } from "~/sections/data-providers";
//import '../single-section/main.styl';
import "./main.styl";

const Section = function (props) {
  const { id } = props;
  const settings = useSettings();
  return h("div.figure-part", [
    h("h2", id),
    h(SectionComponent, {
      isEditable: false,
      ...props,
      ...settings,
    }),
  ]);
};

// const Sequence = (props)=>{
//   const {num, description} = props
//   return h('div.sequence', )
//
// }

const SectionPanel = (props) => {
  return h("div.section-panel", [
    h("div.sequence.s3", [
      h(Section, {
        id: "G",
        sectionID: "J",
        range: [472, 492],
      }),
      h(Section, {
        id: "H",
        sectionID: "J",
        range: [642, 662],
      }),
    ]),
    h("div.sequence.s2", [
      h(Section, {
        id: "D",
        sectionID: "F",
        range: [2, 22],
      }),
      h(Section, {
        id: "E",
        sectionID: "J",
        range: [298, 318],
      }),
      h(Section, {
        id: "F",
        sectionID: "J",
        range: [322.5, 342.5],
      }),
    ]),
    h("div.sequence.s1", [
      h(Section, {
        id: "A",
        sectionID: "J",
        range: [45, 60],
      }),
      h(Section, {
        id: "B",
        sectionID: "B",
        range: [38, 53],
      }),
      h(Section, {
        id: "C",
        sectionID: "J",
        range: [145, 160],
      }),
    ]),
  ]);
};

const SectionDetailSettings = C(SettingsProvider, { ...defaultSettings });

const Figure = compose(
  PlatformProvider,
  SectionDataProvider,
  SectionDetailSettings,
  SectionPanel
);

export default (el, opts, cb) => render(h(Figure), el, cb);
