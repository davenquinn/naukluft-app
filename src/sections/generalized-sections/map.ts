import h from "@macrostrat/hyper";
import {
  useMapboxRequestTransformer,
  TiledMapArea,
  computeTiledBoundsForMap,
  useInsetMapStyle,
  Scalebar,
} from "@macrostrat/static-map-utils";
import { Map } from "maplibre-gl";
import maplibre from "maplibre-gl";
import { useQuery } from "naukluft-data-backend";
import { mergeStyles } from "@macrostrat/mapbox-utils";

const mapboxToken = import.meta.env.VITE_MAPBOX_API_TOKEN;

function useGeneralizedSectionsStyle(metersPerPixel) {
  // Placeholder for style fetching logic
  const res = useQuery("sections/section-geometry");

  const style = useInsetMapStyle(mapboxToken);

  if (style == null) return null;

  // Build style for generalized sections
  const sectionsStyle = {
    glyphs: "mapbox://fonts/openmaptiles/{fontstack}/{range}.pbf",
    sources: {
      sections: {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: res.map((d: any) => {
            const { geometry, ...properties } = d;
            return {
              type: "Feature",
              geometry,
              properties: {
                ...properties,
                pixel_radius: d.radius / metersPerPixel + 5,
              },
            };
          }),
        },
      },
    },
    layers: [
      {
        id: "sections-locations",
        type: "circle",
        paint: {
          "circle-radius": 3,
          "circle-color": "#888",
        },
        source: "sections",
        filter: [
          "all",
          ["get", "in_strat_model"],
          ["!", ["get", "is_generalized"]],
        ],
      },
      {
        id: "generalized-sections-locations",
        type: "circle",
        paint: {
          "circle-radius": ["get", "pixel_radius"],
          "circle-color": "#1E90FF44",
          "circle-stroke-color": "dodgerblue",
          "circle-stroke-width": 1,
        },
        source: "sections",
        filter: ["all", ["get", "in_strat_model"], ["get", "is_generalized"]],
      },
      {
        id: "generalized-sections-labels",
        type: "symbol",
        source: "sections",
        layout: {
          "text-field": ["get", "section_id"],
          "text-size": 14,
          "text-font": ["PT Serif Bold"],
          "text-variable-anchor": ["top", "bottom", "left", "right"],
          "text-radial-offset": ["+", ["/", ["get", "pixel_radius"], 12], 0.1],
        },
        paint: {
          "text-color": "#374d6b",
          "text-halo-color": "#FFFFFF",
          "text-halo-width": 2,
        },
        filter: ["get", "is_generalized"],
      },
    ],
  };

  return mergeStyles(style, sectionsStyle);
}

export function GeneralizedSectionsMap({
  bounds,
  className,
  sections,
  metersPerPixel = 200,
}: {
  bounds: [number, number, number, number];
  initializeMap: any;
}) {
  const tileBounds = computeTiledBoundsForMap(bounds, {
    metersPerPixel,
    tileSize: 512,
    padding: 50,
  });

  const transformRequest = useMapboxRequestTransformer(mapboxToken);

  const style = useGeneralizedSectionsStyle(metersPerPixel);

  if (style == null) return null;

  return h(
    "div.inset-map",
    { className },
    h(
      TiledMapArea,
      {
        tileBounds: tileBounds,
        style,
        initializeMap(opts: maplibre.MapOptions) {
          console.log("Styles", opts.style);
          return new Map({
            ...opts,
            transformRequest,
            pixelRatio: 8,
          });
        },
      },
      h(Scalebar, {
        className: "map-scalebar",
        scale: tileBounds.realMetersPerPixel,
        width: 100,
      }),
    ),
  );
}
