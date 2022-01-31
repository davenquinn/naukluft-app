import "./main.styl";
import { useState } from "react";
import h from "@macrostrat/hyper";
// import { LegendPanel } from "./legend";
// Maybe this should go in main thread
import loadable from "@loadable/component";
import { AppDrawer, NavigationControl } from "~/components";
import { Spinner, Button, ButtonGroup } from "@blueprintjs/core";
import { useQuery } from "naukluft-data-backend";
import mapboxgl from "mapbox-gl";

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

  const [enableGeology, setEnableGeology] = useState(true);
  const [enableMeasurements, setEnableMeasurements] = useState(false);
  const measurements = useQuery("map-data/orientations");
  console.log(measurements);

  return h("div#map-root", {}, [
    h("div#map-panel-container", {}, [
      h(NavigationControl, {
        toggleSettings() {
          setActive(!isActive);
        }
      }),
      h(MapPanel, {
        enableGeology,
        reloaderURL: process.env.NAUKLUFT_MAP_RELOADER_URL,
        onMapLoaded(map) {
          var popup = new mapboxgl.Popup({
            closeButton: false,
            closeOnClick: false
          });

          map.on("mouseenter", "measurements", function(e) {
            var coordinates = e.features[0].geometry.coordinates.slice();
            var description: string = e.features[0].properties.notes;
            console.log(description);
            if (description == null || description == "null") return;
            // Change the cursor style as a UI indicator.
            map.getCanvas().style.cursor = "pointer";
            // Ensure that if the map is zoomed out such that multiple
            // copies of the feature are visible, the popup appears
            // over the copy being pointed to.
            while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
              coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
            }

            // Populate the popup and set its coordinates
            // based on the feature found.
            popup
              .setLngLat(coordinates)
              .setHTML(description)
              .addTo(map);
          });

          map.on("mouseleave", "measurements", function() {
            map.getCanvas().style.cursor = "";
            popup.remove();
          });
        },
        sources: {
          measurements: measurements?.map(d => {
            const { geometry, id, notes, ...properties } = d;
            let newNotes = notes?.trim();
            if (newNotes == "") newNotes = null;
            return {
              geometry,
              id,
              properties: { ...properties, notes: newNotes }
            };
          })
        },
        layers: {
          measurements: {
            source: "measurements",
            type: "circle",
            paint: {
              "circle-color": "#becaff",
              "circle-stroke-color": "#dee4fb",
              "circle-stroke-width": 1,
              "circle-radius": ["case", ["!=", ["get", "notes"], null], 5, 3]
            }
          }
        }
      }),

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
          ),
          h(
            Button,
            {
              active: enableMeasurements,
              onClick() {
                setEnableMeasurements(!enableMeasurements);
              }
            },
            "Measurements"
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

export { MapView };
