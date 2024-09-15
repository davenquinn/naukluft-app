import h, { compose, C } from "@macrostrat/hyper";
import { render } from "react-dom";
import { SettingsProvider, useSettings } from "@macrostrat/column-components";
import { SectionComponent } from "./column";
import { defaultSettings } from "../single-section/settings";
import { PlatformProvider } from "~/platform";
import { SectionDataProvider, useSection } from "~/sections/data-providers";
import { sectionSwatches } from "./swatch-data";
//import '../single-section/main.styl';
import "./main.styl";

const pages = Object.keys(sectionSwatches);

export const SectionDetailsPanel = (props) => {
  return h("div.section-panel", [
    h(Sequence, { id: "s3" }),
    h(Sequence, { id: "s2" }),
    h(Sequence, { id: "s1" }),
  ]);
};



export const SectionDetailSettings = C(SettingsProvider, {
  ...defaultSettings,
});

export const SectionDetails = compose(
  SectionDetailSettings,
  SectionDetailsPanel
);



const Figure = compose(PlatformProvider, SectionDataProvider, SectionDetails);


const Section = function (props) {
  const { id } = props;
  const settings = useSettings();
  return h("div.figure-part", [
    //h("h2", id),
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

export const Sequence = ({ id }: { id: string }) => {
  console.log("Sequence", id);
  return h(
    "div.sequence",
    { className: id },
    sectionSwatches[id].map((d) => h(Section, d))
  );
};


export default (el, opts, cb) => render(h(Figure), el, cb);
