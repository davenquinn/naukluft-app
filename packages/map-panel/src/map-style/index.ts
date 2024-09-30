import axios from "axios";
import { createLineSymbolLayers } from "./symbol-layers";

const createGeologySource = (baseURL, bustCache = false) => {
  let uri = `${baseURL}/{z}/{x}/{y}.pbf`;
  if (bustCache) {
    uri += `?dt=${Date.now()}`;
  }
  return {
    type: "vector",
    tiles: [uri],
    maxzoom: 15,
    minzoom: 5,
  };
};

const emptyStyle = {
  version: 8,
  name: "Empty",
  metadata: {
    "mapbox:autocomposite": true,
  },
  glyphs: "mapbox://fonts/mapbox/{fontstack}/{range}.pbf",
  sources: {},
  layers: [
    {
      id: "background",
      type: "background",
      paint: {
        "background-color": "rgba(0,0,0,0)",
      },
    },
  ],
};

function add3DLayers(baseStyle) {
  let style = { ...baseStyle };
  style.sources["mapbox-dem"] = {
    type: "raster-dem",
    url: "mapbox://mapbox.mapbox-terrain-dem-v1",
    tileSize: 512,
    maxzoom: 14,
  };

  const skyLayer = {
    id: "sky",
    type: "sky",
    paint: {
      "sky-type": "atmosphere",
      "sky-atmosphere-sun": [0.0, 0.0],
      "sky-atmosphere-sun-intensity": 15,
    },
  };

  style.layers = [...baseStyle.layers, skyLayer];
  return style;
}

const geologyLayerDefs = function (
  colors = {},
  patterns = {},
  usePatterns = true
) {
  let patternPaint = {};
  if (usePatterns) {
    patternPaint = {
      "fill-pattern": ["concat", ["get", "unit_id"], "_fill"],
    };
  }

  return [
    {
      id: "unit",
      source: "geology",
      "source-layer": "bedrock",
      type: "fill",
      minzoom: 11,
      paint: {
        // Fallback color...
        "fill-color": ["get", ["get", "unit_id"], ["literal", colors]],
        "fill-opacity": 1,
        ...patternPaint,
      },
    },
    {
      id: "unit-lowzoom",
      source: "geology",
      "source-layer": "bedrock",
      type: "fill",
      maxzoom: 10,
      paint: {
        "fill-color": ["get", ["get", "unit_id"], ["literal", colors]],
        "fill-opacity": 0.5,
      },
    },
    {
      id: "bedrock-contact",
      source: "geology",
      "source-layer": "contact",
      type: "line",
      layout: {
        "line-cap": "round",
      },
      paint: {
        "line-color": "#000000",
        "line-width": [
          "interpolate",
          ["exponential", 2],
          ["zoom"],
          10,
          ["*", 3, ["^", 2, -6]],
          24,
          ["*", 3, ["^", 2, 8]],
        ],
      },
      filter: [
        "all",
        ["!=", "surficial", ["get", "type"]],
        ["!=", "thrust-fault", ["get", "type"]],
      ],
    },
    {
      id: "thrust-fault",
      source: "geology",
      "source-layer": "contact",
      type: "line",
      layout: {
        "line-cap": "round",
      },
      paint: {
        "line-color": "#000000",
        "line-width": [
          "interpolate",
          ["exponential", 2],
          ["zoom"],
          10,
          ["*", 5, ["^", 2, -6]],
          24,
          ["*", 5, ["^", 2, 8]],
        ],
      },
      filter: ["==", "thrust-fault", ["get", "type"]],
    },
    ...createLineSymbolLayers(),
    {
      id: "surficial-contact",
      source: "geology",
      "source-layer": "contact",
      type: "line",
      layout: {
        "line-cap": "round",
      },
      paint: {
        "line-color": "#ffbe17",
      },
      filter: ["==", "surficial", ["get", "type"]],
    },
    {
      id: "surface",
      source: "geology",
      "source-layer": "surficial",
      type: "fill",
      paint: {
        "fill-color": ["get", ["get", "unit_id"], ["literal", colors]],
        //"fill-pattern": ["get", ["get", "unit_id"], ["literal", patterns]],
        "fill-opacity": 0.5,
      },
    },
    {
      id: "watercourse",
      source: "geology",
      "source-layer": "line",
      type: "line",
      paint: {
        "line-color": "#3574AC",
        "line-width": 1,
      },
      filter: ["==", "watercourse", ["get", "type"]],
    },
    {
      id: "line",
      source: "geology",
      "source-layer": "line",
      type: "line",
      paint: {
        "line-color": "#cccccc",
      },
      filter: ["!=", "watercourse", ["get", "type"]],
    },
  ];
};

function geologyLayerIDs() {
  const defs = geologyLayerDefs();
  return defs.map((d) => d.id);
}

const createGeologyStyle = function (
  baseStyle,
  polygonTypes: any[],
  hostName = "http://localhost:5555",
  usePatterns = true
) {
  const colors = {};
  const patterns = {};
  for (let d of polygonTypes) {
    colors[d.id] = d.color;
    patterns[d.id] = d.symbol ?? null;
  }

  const geologyLayers = geologyLayerDefs(colors, patterns, usePatterns);

  let style = baseStyle;
  style.sources.geology = createGeologySource(hostName);
  style.layers = [...baseStyle.layers, ...geologyLayers];
  return style;
};

async function getMapboxStyle(url, { access_token }) {
  const res = await axios.get(url, { params: { access_token } });
  return res.data;
}

export {
  emptyStyle,
  createGeologyStyle,
  add3DLayers,
  createGeologySource,
  getMapboxStyle,
  geologyLayerIDs,
};
