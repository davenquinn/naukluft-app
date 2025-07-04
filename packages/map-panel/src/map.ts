import mapboxgl, { Map } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { get } from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import h from "@macrostrat/hyper";
import { debounce, map } from "underscore";
import mbxUtils from "mapbox-gl-utils";
import {
  createGeologyStyle,
  add3DLayers,
  geologyLayerIDs,
  getMapboxStyle,
  createGeologySource,
  emptyStyle,
} from "./map-style";
import { createUnitFill } from "./map-style/pattern-fill";
import io, { Socket } from "socket.io-client";
import { apiBaseURL } from "naukluft-data-backend";

import { lineSymbols } from "./map-style/symbol-layers";
import { useStoredState } from "packages/ui-components/src";

mapboxgl.accessToken = process.env.MAPBOX_API_TOKEN;

const vizBaseURL = "//visualization-assets.s3.amazonaws.com";
const patternBaseURL = vizBaseURL + "/geologic-patterns/png";
const lineSymbolsURL = vizBaseURL + "/geologic-line-symbols/png";

const satellite = "mapbox://styles/mapbox/satellite-v9";
const terrain = "mapbox://styles/jczaplewski/ckml6tqii4gvn17o073kujk75";

async function loadImage(map, url: string) {
  return new Promise((resolve, reject) => {
    map.loadImage(url, function (err, image) {
      // Throw an error if something went wrong
      if (err) reject(err);
      // Declare the image
      resolve(image);
    });
  });
}

async function setupLineSymbols(map) {
  return Promise.all(
    lineSymbols.map(async function (symbol) {
      if (map.hasImage(symbol)) return;
      const image = await loadImage(map, lineSymbolsURL + `/${symbol}.png`);
      if (map.hasImage(symbol)) return;
      map.addImage(symbol, image, { sdf: true, pixelRatio: 3 });
    }),
  );
}

async function setupStyleImages(map, polygonTypes) {
  return Promise.all(
    polygonTypes.map(async function (type: any) {
      const { symbol, id } = type;
      const uid = id + "_fill";
      if (map.hasImage(uid)) return;
      const url = symbol == null ? null : patternBaseURL + `/${symbol}.png`;
      const img = await createUnitFill({
        patternURL: url,
        color: type.color,
        patternColor: type.symbol_color,
      });
      if (map.hasImage(uid)) return;
      map.addImage(uid, img, { sdf: false, pixelRatio: 12 });
    }),
  );
}

interface MapStyleBuilderOpts {
  geology?: boolean;
  terrain?: boolean;
  patterns?: boolean;
}

export async function createMapStyle(
  map = null,
  styleUrl: string | null = null,
  opts: MapStyleBuilderOpts = {},
) {
  const { geology = true, terrain = true, patterns = true } = opts;
  const { data: polygonTypes } = await get(
    `${apiBaseURL}/map-data/polygon-types`,
  );
  let baseStyle = emptyStyle;
  if (styleUrl != null) {
    const baseURL = styleUrl.replace(
      "mapbox://styles",
      "https://api.mapbox.com/styles/v1",
    );
    baseStyle = await getMapboxStyle(baseURL, {
      access_token: mapboxgl.accessToken,
    });
  }
  if (terrain) {
    baseStyle = add3DLayers(baseStyle);
  }
  if (!geology) return baseStyle;
  if (map != null) {
    await setupLineSymbols(map);
    await setupStyleImages(map, polygonTypes);
  }
  return createGeologyStyle(
    baseStyle,
    polygonTypes,
    apiBaseURL + "/map-data/map-tiles",
    patterns,
  );
}

function setupTerrain(map: mapboxgl.Map) {
  if (map.getSource("mapbox-dem") == null) return;
  console.log("Setting up terrain layer");
  map.setTerrain({ source: "mapbox-dem", exaggeration: 1 });
}

function initializeMap(
  el: HTMLElement,
  baseLayer: string,
  onStyleLoaded = null,
) {
  //const style = createStyle(polygonTypes);

  const map = new mapboxgl.Map({
    container: el,
    style: baseLayer,
    hash: true,
    center: [16.1987, -24.2254],
    zoom: 10,
    antialias: true,
  });

  //map.setStyle("mapbox://styles/jczaplewski/cklb8aopu2cnv18mpxwfn7c9n");
  map.on("load", async function () {
    let style = await createMapStyle(map, baseLayer, { geology: true });

    map.setStyle(style);
    setupTerrain(map);
    map.on("idle", () => {
      onStyleLoaded?.(map);
    });
  });

  map.on("style.load", async function () {
    console.log("Reloaded style");
    setupTerrain(map);
  });

  mbxUtils.init(map, mapboxgl);

  return map;
}

export const defaultBaseLayers = [
  {
    id: "satellite",
    name: "Satellite",
    url: "mapbox://styles/mapbox/satellite-v9",
  },
  {
    id: "hillshade",
    name: "Hillshade",
    url: terrain,
  },
];

const noop = () => {};

function reloadGeologySource(map: Map) {
  console.log("Reloading geology source");

  const newSource = createGeologySource(
    apiBaseURL + "/map-data/map-tiles",
    true,
  );
  //const newID = `geology-${ix}`;
  map.getSource("geology").tiles = newSource.tiles;

  const sourceCache = map.style?._sourceCaches["other:geology"];

  // Clear the tile cache for a particular source
  sourceCache.clearTiles();

  // Load the new tiles for the current viewport (map.transform -> viewport)
  sourceCache.update(map.transform);
  map.triggerRepaint();
  //map.addSource(newID, createGeologySource(apiBaseURL + "/map-data/map-tiles"));
  //map.U.setLayerSource(geologyLayerIDs(), newID);
  //map.removeSource(sourceID);
  //return newID;
}

interface MapComponentProps {
  reloaderURL: string | null;
  reloaderSocket: Socket | null;
}

export function useMapReloader(reloaderURL: string): Socket | null {
  // reloading for in-development map
  const socket = useRef<Socket | null>(null);

  // Start up reloader if appropriate
  useEffect(() => {
    if (socket.current == null && reloaderURL != null) {
      socket.current = io(reloaderURL!, { transports: ["websocket"] });
      console.log("Setting up reloader");
      socket.current?.connect();
    }
  }, [reloaderURL]);

  return socket.current;
}

export function MapComponent({
  reloaderSocket,
  enableGeology = true,
  baseLayer = defaultBaseLayers[0].url,
  sources = {},
  layers = {},
  layerVisibility = {},
  onMapLoaded = null,
}) {
  const ref = useRef<HTMLElement>();

  //const [geologySourceID, setGeologySourceID] = useState(`geology-${ix}`);
  const mapRef = useRef<Map>();

  const [styleLoaded, setStyleLoaded] = useState(false);

  // Initialize map
  useEffect(() => {
    if (ref.current == null) return;
    const mapObj = initializeMap(ref.current, baseLayer, () => {
      setStyleLoaded(true);
    });
    mapRef.current = mapObj;
    return () => mapRef.current.remove();
  }, [ref]);

  useEffect(() => {
    const map = mapRef.current;
    if (map?.style == null) return;
    if (!styleLoaded) return;
    console.log("Loading extra layers");
    for (const [k, features] of Object.entries(sources)) {
      if (!features?.length) continue;
      if (map.getSource(k) != null) continue;
      map.addSource(k, {
        type: "geojson",
        data: { type: "FeatureCollection", features },
      });
    }

    for (const [k, layer] of Object.entries(layers)) {
      if (map.getLayer(k) != null) continue;
      map.addLayer({
        ...layer,
        id: k,
      });
    }
    // Not sure why we need to do this here...
    onMapLoaded?.(map);
  }, [mapRef, styleLoaded, sources, layers]);

  const sourceReloader = useCallback(() => {
    if (mapRef.current == null) return noop;
    return debounce(() => {
      reloadGeologySource(mapRef.current);
    }, 500);
  }, [mapRef.current]);

  // Start up reloader if appropriate
  useEffect(() => {
    if (reloaderSocket == null) {
      console.log("Reloader not found");
      return;
    }
    console.log("Setting up reloader");
    reloaderSocket.on("topology", (message) => {
      console.log("Reloading map due to topology change");
      console.log(message);
      //reloadGeologySource(mapRef.current);
    });

    return () => {
      reloaderSocket?.off("topology");
      //reloaderSocket?.off("server-heartbeat");
    };
  }, [reloaderSocket]);

  useEffect(() => {
    const map = mapRef.current;
    if (map?.style == null) return;
    if (!styleLoaded) return;
    console.log(enableGeology);
    for (const lyr of geologyLayerIDs()) {
      map.setLayoutProperty(
        lyr,
        "visibility",
        enableGeology ? "visible" : "none",
      );
    }
  }, [mapRef, enableGeology, styleLoaded]);

  useEffect(() => {
    const map = mapRef.current;
    if (map == null) return;
    createMapStyle(map, baseLayer).then((style) => map.setStyle(style));
  }, [mapRef, baseLayer]);

  useEffect(() => {
    const map = mapRef.current;
    if (map?.style == null) return;
    if (!styleLoaded) return;
    for (const [k, v] of Object.entries(layerVisibility)) {
      map.setLayoutProperty(k, "visibility", v ? "visible" : "none");
    }
  }, [styleLoaded, layerVisibility]);

  return h("div.map-area", [h("div.map", { ref })]);
}
