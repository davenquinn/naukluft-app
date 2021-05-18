import mapboxgl, { Map } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { get } from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import h from "@macrostrat/hyper";
import { debounce } from "underscore";
import mbxUtils from "mapbox-gl-utils";
import {
  createGeologyStyle,
  createBasicStyle,
  geologyLayerIDs,
  getMapboxStyle,
  createGeologySource
} from "./map-style";
import { createUnitFill } from "./map-style/pattern-fill";
import io from "socket.io-client";
import { apiBaseURL } from "naukluft-data-backend";

import { lineSymbols } from "./map-style/symbol-layers";

mapboxgl.accessToken = process.env.MAPBOX_API_TOKEN;

const vizBaseURL = "//visualization-assets.s3.amazonaws.com";
const patternBaseURL = vizBaseURL + "/geologic-patterns/png";
const lineSymbolsURL = vizBaseURL + "/geologic-line-symbols/png";

const satellite = "mapbox://styles/mapbox/satellite-v9";
const terrain = "mapbox://styles/jczaplewski/ckml6tqii4gvn17o073kujk75";

async function loadImage(map, url: string) {
  return new Promise((resolve, reject) => {
    map.loadImage(url, function(err, image) {
      // Throw an error if something went wrong
      if (err) reject(err);
      // Declare the image
      resolve(image);
    });
  });
}

async function setupLineSymbols(map) {
  return Promise.all(
    lineSymbols.map(async function(symbol) {
      const image = await loadImage(map, lineSymbolsURL + `/${symbol}.png`);
      if (map.hasImage(symbol)) return;
      map.addImage(symbol, image, { sdf: true, pixelRatio: 3 });
    })
  );
}

async function setupStyleImages(map, polygonTypes) {
  return Promise.all(
    polygonTypes.map(async function(type: any) {
      const { symbol, id } = type;
      const uid = id + "_fill";
      if (map.hasImage(uid)) return;
      const url = symbol == null ? null : patternBaseURL + `/${symbol}.png`;
      const img = await createUnitFill({
        patternURL: url,
        color: type.color,
        patternColor: type.symbol_color
      });

      map.addImage(uid, img, { sdf: false, pixelRatio: 12 });
    })
  );
}

async function createMapStyle(map, url, enableGeology = true) {
  const { data: polygonTypes } = await get(
    `${apiBaseURL}/map-data/polygon-types`
  );
  const baseURL = url.replace(
    "mapbox://styles",
    "https://api.mapbox.com/styles/v1"
  );
  let baseStyle = await getMapboxStyle(baseURL, {
    access_token: mapboxgl.accessToken
  });
  baseStyle = createBasicStyle(baseStyle);
  if (!enableGeology) return baseStyle;
  await setupLineSymbols(map);
  await setupStyleImages(map, polygonTypes);
  return createGeologyStyle(
    baseStyle,
    polygonTypes,
    apiBaseURL + "/map-data/map-tiles"
  );
}

async function initializeMap(el: HTMLElement, baseLayer: string) {
  //const style = createStyle(polygonTypes);

  const map = new mapboxgl.Map({
    container: el,
    style: baseLayer,
    hash: true,
    center: [16.1987, -24.2254],
    zoom: 10,
    antialias: true
  });

  //map.setStyle("mapbox://styles/jczaplewski/cklb8aopu2cnv18mpxwfn7c9n");
  map.on("load", async function() {
    const style = await createMapStyle(map, baseLayer, true);
    map.setStyle(style);
    if (map.getSource("mapbox-dem") == null) return;
    map.setTerrain({ source: "mapbox-dem", exaggeration: 1.5 });
  });

  map.on("style.load", async function() {
    console.log("Reloaded style");
    if (map.getSource("mapbox-dem") == null) return;
    map.setTerrain({ source: "mapbox-dem", exaggeration: 1.5 });
  });

  mbxUtils.init(map, mapboxgl);

  return map;
}

export const defaultBaseLayers = [
  {
    id: "satellite",
    name: "Satellite",
    url: "mapbox://styles/mapbox/satellite-v9"
  },
  {
    id: "hillshade",
    name: "Hillshade",
    url: terrain
  }
];

const noop = () => {};

let ix = 0;
function reloadGeologySource(map: Map, sourceID: string) {
  ix += 1;
  const newID = `geology-${ix}`;
  map.addSource(newID, createGeologySource(apiBaseURL + "/map-data/map-tiles"));
  map.U.setLayerSource(geologyLayerIDs(), newID);
  map.removeSource(sourceID);
  return newID;
}

export function MapComponent({
  useReloader = false,
  enableGeology = true,
  baseLayer = defaultBaseLayers[0].url
}) {
  const ref = useRef<HTMLElement>();

  const [geologySourceID, setGeologySourceID] = useState(`geology-${ix}`);
  const mapRef = useRef<Map>();

  // reloading for in-development map
  const socket = useRef(useReloader ? io(apiBaseURL) : null);

  // Initialize map
  useEffect(() => {
    if (ref.current == null) return;
    initializeMap(ref.current, baseLayer).then(mapObj => {
      mapRef.current = mapObj;
    });
    return () => mapRef.current.remove();
  }, [ref]);

  const sourceReloader = useCallback(() => {
    if (mapRef.current == null) return noop;
    return debounce(() => {
      const newID = reloadGeologySource(mapRef.current, geologySourceID);
      setGeologySourceID(newID);
    }, 500);
  }, [mapRef, geologySourceID]);

  // Start up reloader if appropriate
  useEffect(() => {
    socket?.current?.on("topology", message => {
      console.log(message);
      sourceReloader();
    });
    return () => {
      socket?.current?.off("topology");
    };
  }, [socket]);

  useEffect(() => {
    const map = mapRef.current;
    if (map?.style == null) return;
    console.log(enableGeology);
    for (const lyr of geologyLayerIDs()) {
      map.setLayoutProperty(
        lyr,
        "visibility",
        enableGeology ? "visible" : "none"
      );
    }
  }, [mapRef, enableGeology]);

  useEffect(() => {
    const map = mapRef.current;
    if (map == null) return;
    createMapStyle(map, baseLayer).then(style => map.setStyle(style));
  }, [mapRef, baseLayer]);

  return h("div.map-area", [h("div.map", { ref })]);
}
