import "./main.styl";
import { useState } from "react";
import h from "@macrostrat/hyper";
// import { LegendPanel } from "./legend";
// Maybe this should go in main thread
import loadable from "@loadable/component";
import { AppDrawer, NavigationControl } from "~/components";
import { Spinner, Button, ButtonGroup } from "@blueprintjs/core";

const MapPanel = loadable(() => import("@naukluft/map-panel"), {
  fallback: h(Spinner)
});

function BaseLayerSwitcher({ layers, activeLayer, onSetLayer }) {
  return h(
    ButtonGroup,
    { vertical: true },
    layers.map(d => {
      return h(
        Button,
        {
          active: d == activeLayer,
          //disabled: d == activeLayer,
          onClick() {
            if (d == activeLayer) return;
            onSetLayer(d);
          }
        },
        d.name
      );
    })
  );
}

function MapView() {
  const [isActive, setActive] = useState(false);

  return h("div#map-root", {}, [
    h("div#map-panel-container", {}, [
      h(NavigationControl, {
        toggleSettings() {
          setActive(!isActive);
        }
      }),
      h(MapPanel),

      h(
        AppDrawer,
        {
          isOpen: isActive,
          title: "Settings",
          onClose() {
            setActive(false);
          }
        },
        [
          h("h3", "Geology layers")
          /*
          h("h3", "Basemap"),
          h("div.map-controls", null, [
            h(
              Button,
              {
                active: enableGeology,
                onClick() {
                  setEnableGeology(!enableGeology);
                }
              },
              "Geology"
            ),
            h(BaseLayerSwitcher, {
              layers: baseLayers,
              activeLayer: activeLayer,
              onSetLayer(layer) {
                setActiveLayer(layer);
              }
            })
            */
        ]
      )
    ])
    //h(LegendPanel, { isActive })
  ]);
}

export { MapView };
