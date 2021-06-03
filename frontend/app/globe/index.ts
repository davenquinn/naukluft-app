import { useState } from "react";
import h from "@macrostrat/hyper";
// import { LegendPanel } from "./legend";
// Maybe this should go in main thread
import loadable from "@loadable/component";
import { AppDrawer, NavigationControl } from "~/components";
import { Spinner, Button, ButtonGroup } from "@blueprintjs/core";
import { ErrorBoundary } from "@macrostrat/ui-components";

const Globe = loadable(() => import("./cesium-view"), {
  fallback: h(Spinner)
});

function GlobeView() {
  const [isActive, setActive] = useState(false);
  const [enableGeology, setEnableGeology] = useState(true);

  return h("div#map-root", {}, [
    h("div#map-panel-container", {}, [
      h(NavigationControl, {
        toggleSettings() {
          setActive(!isActive);
        }
      }),
      h(ErrorBoundary, [h(Globe)]),
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
          h("h3", "Geology layers"),
          h(
            Button,
            {
              active: enableGeology,
              onClick() {
                setEnableGeology(!enableGeology);
              }
            },
            "Geology"
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
