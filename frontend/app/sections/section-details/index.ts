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

const Section = function(props) {
  const { id } = props;
  const settings = useSettings();
  return h("div.figure-part", [
    h("h2", id),
    h(SectionComponent, {
      isEditable: false,
      ...props,
      ...settings
    })
  ]);
};

// const Sequence = (props)=>{
//   const {num, description} = props
//   return h('div.sequence', )
//
// }

const Sequence = ({ id }: { id: string }) => {
  return h(
    "div.sequence",
    { className: id },
    sectionSwatches[id].map(d => h(Section, d))
  );
};

const SectionPanel = props => {
  return h("div.section-panel", [
    h(Sequence, { id: "s3" }),
    h(Sequence, { id: "s2" }),
    h(Sequence, { id: "s1" })
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
