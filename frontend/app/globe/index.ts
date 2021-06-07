import { useState } from "react";
import h from "@macrostrat/hyper";
// import { LegendPanel } from "./legend";
// Maybe this should go in main thread
import loadable from "@loadable/component";
import { AppDrawer, NavigationControl } from "~/components";
import { Spinner, Switch } from "@blueprintjs/core";
import {
  getInitialPosition,
  buildPositionHash
} from "@macrostrat/cesium-viewer/query-string";
import { ErrorBoundary } from "@macrostrat/ui-components";
import update from "immutability-helper";
import { getHashString, setHashString } from "@macrostrat/ui-components";
import { useEffect } from "react";
import { initial } from "underscore";
import { array } from "prop-types";

const Globe = loadable(() => import("./cesium-view"), {
  fallback: h(Spinner)
});

enum Layer {
  Geology = "geology",
  Photogrammetry = "photogrammetry"
}

function LayerSwitch({ layer, layers, setLayers, children }) {
  const checked = layers.has(layer);
  return h(
    Switch,
    {
      checked,
      onChange() {
        const action = checked ? "$remove" : "$add";
        const newLayers = update(layers, { [action]: [layer] });
        setLayers(newLayers);
      }
    },
    children
  );
}

const defaultPosition = getInitialPosition({
  a: 314,
  e: 67,
  x: 16.2015,
  y: -24.4099,
  z: 3219
});

const layerVals = Object.values(Layer);

let { layers: initialLayers, ...loc } = getHashString();
if (!Array.isArray(initialLayers)) {
  initialLayers = [initialLayers];
}
initialLayers = initialLayers.filter(d => layerVals.includes(d));
if (initialLayers.length == 0) {
  initialLayers = [Layer.Geology];
}

const initialPosition = getInitialPosition(loc, defaultPosition);

function GlobeView() {
  const [isActive, setActive] = useState(false);
  const [layers, setLayers] = useState<Set<Layer>>(new Set(initialLayers));
  const [pos, setPos] = useState(initialPosition);

  useEffect(() => {
    const p = buildPositionHash(pos);
    setHashString({ ...p, layers: Array.from(layers) });
  }, [pos, layers]);

  return h("div#map-root", {}, [
    h("div#map-panel-container", {}, [
      h(NavigationControl, {
        toggleSettings() {
          setActive(!isActive);
        }
      }),
      h(ErrorBoundary, [
        h(Globe, {
          showPhotogrammetry: layers.has(Layer.Photogrammetry),
          showGeology: layers.has(Layer.Geology),
          initialPosition: pos,
          onViewChange(cpos) {
            setPos(cpos.camera);
          }
        })
      ]),
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
            LayerSwitch,
            { layers, layer: Layer.Geology, setLayers },
            "Geology"
          ),
          h(
            LayerSwitch,
            {
              layers,
              layer: Layer.Photogrammetry,
              setLayers
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
