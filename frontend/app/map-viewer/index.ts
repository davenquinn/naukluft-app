import "./main.styl";
import { useState } from "react";
import h from "react-hyperscript";
import { LegendPanel } from "./legend";
import { MapNavigationControl } from "./nav";
// Maybe this should go in main thread
import MapPanel from "@naukluft/map-panel";

/*
class MapPanel extends React.Component {
  render() {
    return h("div", { id: "map-container" });
  }

  componentDidMount() {
    let map, tileUrl;
    const el = ReactDOM.findDOMNode(this);

    if (PLATFORM === ELECTRON) {
      tileUrl = "http://localhost:3006/live-tiles/geology";
    } else {
      tileUrl = BASE_URL + "tiles";
    }

    return (map = new mgl.Map({
      container: el,
      attributionControl: false,
      center: [16.1987, -24.2254],
      zoom: 11,
      trackResize: true,
      style: {
        //"mapbox://styles/mapbox/satellite-v9"
        version: 8,
        sources: {
          satellite: {
            type: "raster",
            tiles: ["http://localhost:3006/tiles/satellite/{z}/{x}/{y}.png"],
            tileSize: 256
          },
          geology: {
            type: "raster",
            tiles: [`${tileUrl}/{z}/{x}/{y}.png`],
            tileSize: 256
          }
        },
        layers: [{ id: "geology", type: "raster", source: "geology" }]
      }
    }));
  }
}
*/

function MapView() {
  const [isActive, setActive] = useState(true);

  return h("div#map-root", {}, [
    h("div#map-panel-container", {}, [
      h(MapNavigationControl, {
        toggleLegend() {
          setActive(!isActive);
        }
      }),
      h(MapPanel)
    ]),
    h(LegendPanel, { isActive })
  ]);
}

export { MapView };
