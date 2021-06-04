import { useState } from "react";
import h from "@macrostrat/hyper";
// import { LegendPanel } from "./legend";
// Maybe this should go in main thread
import loadable from "@loadable/component";
import { AppDrawer, NavigationControl } from "~/components";
import { Spinner, Button, ButtonGroup, Switch } from "@blueprintjs/core";
import { ErrorBoundary } from "@macrostrat/ui-components";

const Globe = loadable(() => import("./cesium-view"), {
  fallback: h(Spinner)
});

function GlobeView() {
  const [isActive, setActive] = useState(false);
  const [enableGeology, setEnableGeology] = useState(true);
  const [showPhotogrammetry, setPhotogrammetry] = useState(true);

  return h("div#map-root", {}, [
    h("div#map-panel-container", {}, [
      h(NavigationControl, {
        toggleSettings() {
          setActive(!isActive);
        }
      }),
      h(ErrorBoundary, [h(Globe, { showPhotogrammetry })]),
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
          h("h3", "Layers"),
          h(
            Switch,
            {
              checked: enableGeology,
              onChange() {
                setEnableGeology(!enableGeology);
              }
            },
            "Geology"
          ),
          h(
            Switch,
            {
              checked: showPhotogrammetry,
              onChange(v) {
                setPhotogrammetry(!showPhotogrammetry);
              }
            },
            "Photogrammetry"
          )
          // h(BaseLayerSwitcher, {
          //   layers: baseLayers,
          //   activeLayer: activeLayer,
          //   onSetLayer(layer) {
          //     setActiveLayer(layer);
          //   }
          // })
        ]
      )
    ])
    //h(LegendPanel, { isActive })
  ]);
}

export default GlobeView;
