import h from "@macrostrat/hyper";
import { InsetMap } from "~/sections/summary-sections/map";
import { useInsetMapStyle } from "@macrostrat/static-map-utils";
import { useQuery } from "naukluft-data-backend";
import { mergeStyles } from "@macrostrat/mapbox-utils";

const mapboxToken = import.meta.env.VITE_MAPBOX_API_TOKEN;

export function Page() {
  const metersPerPixel = 100;
  const style = useOrientationsStyle(metersPerPixel);
  return h("div.sections-map", [
    h(InsetMap, {
      style,
      metersPerPixel,
      className: "orientations-map",
      bounds: [16.06, -24.38, 16.25, -24.2],
      scalebarWidth: 120,
    }),
  ]);
}

function useOrientationsStyle(metersPerPixel) {
  // Placeholder for style fetching logic
  const res = useQuery("map-data/orientations");

  const map = useQuery("map-data/generalized-map");

  const domains = useQuery("map-data/tectonic-domains");

  const style = useInsetMapStyle(mapboxToken);

  if (style == null || res == null || map == null || domains == null)
    return null;

  // Build style for generalized sections
  const orientationsStyle = {
    glyphs: "mapbox://fonts/openmaptiles/{fontstack}/{range}.pbf",
    sources: {
      generalized: {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: map,
        },
      },
      domains: {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: domains,
        },
      },
      orientations: {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: res,
        },
      },
    },
    layers: [
      {
        id: "generalized-map",
        type: "fill",
        source: "generalized",
        paint: {
          "fill-color": ["get", "color"],
          "fill-opacity": 0.6,
          "fill-pattern": [
            "concat",
            "tectonic-element:",
            ["get", "unit_id"],
            ":",
            ["get", "color"],
          ],
        },
        filter: ["!=", ["get", "unit_id"], "nnc"],
      },
      {
        id: "generalized-map-bound",
        type: "line",
        source: "generalized",
        paint: {
          "line-color": "#444",
          "line-width": 1,
        },
        filter: ["!=", ["get", "unit_id"], "nnc"],
      },
      {
        id: "tectonic-domains",
        type: "line",
        source: "domains",
        paint: {
          "line-color": "black",
          "line-width": 2,
        },
      },
      {
        id: "orientations",
        type: "circle",
        source: "orientations",
        paint: {
          "circle-radius": 2,
          "circle-color": "black",
        },
      },
    ],
  };

  return mergeStyles(style, orientationsStyle);
}
