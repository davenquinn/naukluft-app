/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import "./main.styl";
import React from "react";
import ReactDOM from "react-dom";
import mgl from "mapbox-gl/dist/mapbox-gl";
import h from "react-hyperscript";
import {LegendPanel} from "./legend";
import {MapNavigationControl} from "./nav";
import "mapbox-gl/dist/mapbox-gl.css";
// Maybe this should go in main thread
import path from "path";

class MapPanel extends React.Component {
  render() { return h('div', {id: 'map-container'}); }

  componentDidMount() {

    let map, tileUrl;
    const el = ReactDOM.findDOMNode(this);

    if (PLATFORM === ELECTRON) {
      tileUrl = "http://localhost:3006/live-tiles/geology";
    } else {
      tileUrl = BASE_URL+"tiles";
    }

    return map = new mgl.Map({
      container: el,
      attributionControl: false,
      center: [16.1987, -24.2254],
      zoom: 11,
      trackResize: true,
      style: { //"mapbox://styles/mapbox/satellite-v9"
        version: 8,
        sources: {
          satellite: {
            type: 'raster',
            tiles: ["http://localhost:3006/tiles/satellite/{z}/{x}/{y}.png"],
            tileSize: 256
          },
          geology: {
            type: 'raster',
            tiles: [`${tileUrl}/{z}/{x}/{y}.png`],
            tileSize: 256
          }
        },
        layers: [
          {id: "geology", type: "raster", source: "geology"}
        ]
      }});
  }
}

class MapView extends React.Component {
  constructor() {
    this.toggleLegend = this.toggleLegend.bind(this);
    super();
    this.state = {legendIsActive: true};
  }
  toggleLegend() {
    return this.setState({legendIsActive: !this.state.legendIsActive});
  }
  render() {
    return h('div#map-root', {}, [
      h('div#map-panel-container', {}, [
        h(MapNavigationControl, {toggleLegend: this.toggleLegend}),
        h(MapPanel)
      ]),
      h(LegendPanel, {isActive: this.state.legendIsActive})
    ]);
  }
}

export {MapView};
