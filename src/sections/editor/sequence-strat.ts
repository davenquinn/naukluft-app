import { Tabs, Tab, Slider } from "@blueprintjs/core";

import { PickerControl } from "@macrostrat/column-components";
import { LabeledControl } from "@macrostrat/column-components";
import { useContext } from "react";
import { SectionSurfacesContext } from "~/sections/providers";

import { SurfaceOrderSlider } from "@macrostrat/column-components";

import { hyperStyled } from "@macrostrat/hyper";
import styles from "./style.module.styl";
const h = hyperStyled(styles);

const surfaceTypes = [
  { value: "mfs", label: "Maximum flooding surface" },
  { value: "sb", label: "Sequence boundary" }
];

const faciesTransitions = [
  { value: 1, label: "Flooding (transgression)" },
  { value: -1, label: "Shallowing (regression)" }
];

const Panel = props => h("div.tab-panel", props);

const SurfaceTypeControls = props => {
  const { updateSurfaces } = useContext(SectionSurfacesContext);
  const { interval, updateInterval } = props;
  return h(Panel, [
    h(LabeledControl, {
      title: "Surface type",
      is: PickerControl,
      vertical: false,
      isNullable: true,
      states: surfaceTypes,
      activeState: interval.surface_type,
      onUpdate: surface_type => updateInterval({ surface_type })
    }),
    h(LabeledControl, {
      title: "Surface order",
      is: SurfaceOrderSlider,
      interval,
      onChange: val => {
        updateInterval(val);
        updateSurfaces();
      }
    })
  ]);
};

const FaciesTransitionsControls = props => {
  const { interval, updateInterval } = props;

  const { flooding_surface_order } = interval;

  const ix = Math.sign(flooding_surface_order);

  return h(Panel, [
    h(LabeledControl, {
      title: "Facies transition",
      is: PickerControl,
      vertical: false,
      isNullable: true,
      states: faciesTransitions,
      activeState: ix,
      onUpdate: ix => {
        if (ix == null) updateInterval({ flooding_surface_order: null });
        const newOrder = ix * Math.abs(flooding_surface_order);
        return updateInterval({ flooding_surface_order: newOrder });
      }
    }),
    h(LabeledControl, {
      title: "Importance",
      is: Slider,
      min: 1,
      max: 5,
      stepSize: 1,
      value: Math.abs(flooding_surface_order ?? 5),
      showTrackFill: false,
      onChange: num => updateInterval({ flooding_surface_order: ix * num })
    })
  ]);
};

const SequenceStratControls = props => {
  const { interval, updateInterval, children } = props;
  return h(Tabs, { id: "sequence-strat-controls", large: false }, [
    h(
      Tab,
      {
        id: "new",
        panel: h(SurfaceTypeControls, { interval, updateInterval })
      },
      "Sequence stratigraphy"
    ),
    h(
      Tab,
      {
        id: "old",
        panel: h(FaciesTransitionsControls, { interval, updateInterval })
      },
      "Facies trends"
    ),
    children
  ]);
};

export { SequenceStratControls };
