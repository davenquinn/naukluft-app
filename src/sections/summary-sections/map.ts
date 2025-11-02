import hyper from "@macrostrat/hyper";
import {
  useMapboxRequestTransformer,
  TiledMapArea,
  computeTiledBoundsForMap,
  useInsetMapStyle,
  Scalebar,
} from "@macrostrat/static-map-utils";
import {
  setupStyleImageManager,
  defaultResolvers,
} from "@macrostrat/map-styles";
import { Map } from "maplibre-gl";
import maplibre from "maplibre-gl";
import { useQuery } from "naukluft-data-backend";
import { mergeStyles } from "@macrostrat/mapbox-utils";
import { useSectionOrder } from "~/sections/components";
import styles from "./main.module.styl";
import { buildTectonicPatternResolver } from "~/sections/summary-sections/tectonic-pattern-resolver";

const h = hyper.styled(styles);

const mapboxToken = import.meta.env.VITE_MAPBOX_API_TOKEN;

function createSectionLinks(features, order: string[] | null = null) {
  // Reorder features by section_id
  if (order != null && order.length > 0) {
    features.sort((a, b) => {
      const indexA = order.indexOf(a.properties.section_id) ?? -1;
      const indexB = order.indexOf(b.properties.section_id) ?? -1;
      return indexA - indexB;
    });
  }

  console.log("Features", features);

  const links: string[] = [];
  // Iterate through pairs of features
  for (let i = 0; i < features.length - 1; i++) {
    const featureA = features[i];
    const featureB = features[i + 1];

    // Create a LineString feature connecting the two points
    const lineFeature = {
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: [
          featureA.geometry.coordinates,
          featureB.geometry.coordinates,
        ],
      },
    };
    links.push(lineFeature);
  }

  return links;
}

function useGeneralizedSectionsStyle(metersPerPixel) {
  // Placeholder for style fetching logic
  const res = useQuery("sections/section-geometry");

  const style = useInsetMapStyle(mapboxToken);

  if (style == null || res == null) return null;

  const features = res.map((d: any) => {
    const { geometry, ...properties } = d;
    return {
      type: "Feature",
      geometry,
      properties: {
        ...properties,
        pixel_radius: d.radius / metersPerPixel + 5,
      },
    };
  });

  const generalizedLinks = createSectionLinks(
    features.filter((f: any) => f.properties.is_generalized),
    ["Onis", "Ubisis", "Tsams"],
  );

  // Build style for generalized sections
  const sectionsStyle = {
    glyphs: "mapbox://fonts/openmaptiles/{fontstack}/{range}.pbf",
    sources: {
      sections: {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features,
        },
      },
      links: {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: generalizedLinks,
        },
      },
    },
    layers: [
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
        id: "section-links",
        type: "line",
        source: "links",
        paint: {
          "line-color": "#1E90FF",
          "line-width": 2,
        },
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
          "text-color": "dodgerblue",
          "text-halo-color": "#FFFFFF",
          "text-halo-width": 2,
        },
        filter: ["get", "is_generalized"],
      },
      {
        id: "sections-locations",
        type: "circle",
        paint: {
          "circle-radius": 2,
          "circle-color": "#222",
        },
        source: "sections",
        filter: [
          "all",
          ["get", "in_strat_model"],
          ["!", ["get", "is_generalized"]],
        ],
      },
      {
        id: "sections-labels",
        type: "symbol",
        source: "sections",
        layout: {
          "text-field": ["get", "section_id"],
          "text-size": 12,
          "text-font": ["PT Serif Bold"],
          "text-variable-anchor": ["top", "bottom", "left", "right"],
          "text-radial-offset": ["+", ["/", ["get", "pixel_radius"], 12], 0.1],
        },
        paint: {
          "text-color": "#222",
          "text-halo-color": "#FFFFFF",
          "text-halo-width": 1,
        },
        filter: [
          "all",
          ["get", "in_strat_model"],
          ["!", ["get", "is_generalized"]],
        ],
      },
    ],
  };

  return mergeStyles(style, sectionsStyle);
}

export function InsetMap({
  bounds,
  className,
  sections,
  metersPerPixel = 200,
  style,
  scalebarWidth,
}: {
  bounds: [number, number, number, number];
  initializeMap: any;
  scalebarWidth?: number;
}) {
  const tileBounds = computeTiledBoundsForMap(bounds, {
    metersPerPixel,
    tileSize: 512,
    padding: 50,
  });

  const transformRequest = useMapboxRequestTransformer(mapboxToken);

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
          const map = new Map({
            ...opts,
            transformRequest,
            pixelRatio: 8,
          });
          setupStyleImageManager(map, {
            resolvers: {
              ...defaultResolvers,
              "tectonic-element": buildTectonicPatternResolver(),
            },
          });
          return map;
        },
      },
      h(Scalebar, {
        className: "map-scalebar",
        labelPosition: "top",
        scale: tileBounds.realMetersPerPixel,
        width: scalebarWidth ?? 100,
      }),
    ),
  );
}

export function GeneralizedSectionsMap({ metersPerPixel = 200, ...rest }) {
  const style = useGeneralizedSectionsStyle(metersPerPixel);

  return h(InsetMap, { style, metersPerPixel, ...rest });
}

export function SummarySectionsMap({ metersPerPixel = 200, ...rest }) {
  const sectionIDs = useSectionOrder();
  const style = useSummarySectionsStyle(metersPerPixel, sectionIDs);

  return h(InsetMap, { style, metersPerPixel, ...rest });
}

function useSummarySectionsStyle(metersPerPixel, sectionIDs) {
  // Placeholder for style fetching logic
  const res = useQuery("sections/section-geometry");

  const style = useInsetMapStyle(mapboxToken);

  if (style == null || res == null) return null;

  if (
    sectionIDs == null ||
    sectionIDs.length == 0 ||
    sectionIDs[0] != "chemostratigraphy"
  ) {
    return null;
  }

  const features = res.map((d: any) => {
    const { geometry, ...properties } = d;
    return {
      type: "Feature",
      geometry,
      properties: {
        ...properties,
        pixel_radius: d.radius / metersPerPixel + 5,
      },
    };
  });

  const sectionLinks = createSectionLinks(
    features.filter(
      (f: any) => !f.properties.is_generalized && f.properties.correlated,
    ),
    sectionIDs,
  );

  // Build style for generalized sections
  const sectionsStyle = {
    glyphs: "mapbox://fonts/openmaptiles/{fontstack}/{range}.pbf",
    sources: {
      sections: {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features,
        },
      },
      links: {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: sectionLinks,
        },
      },
    },
    layers: [
      {
        id: "sections-locations",
        type: "circle",
        paint: {
          "circle-radius": 3,
          "circle-color": "#444",
        },
        source: "sections",
        filter: [
          "all",
          ["get", "in_strat_model"],
          ["!", ["get", "is_generalized"]],
        ],
      },
      {
        id: "section-links",
        type: "line",
        source: "links",
        paint: {
          "line-color": "#444",
          "line-width": 2,
        },
      },
      {
        id: "generalized-sections-labels",
        type: "symbol",
        source: "sections",
        layout: {
          "text-field": ["get", "location"],
          "text-size": 14,
          "text-font": ["PT Serif Bold"],
          "text-variable-anchor": ["top", "bottom", "left", "right"],
          "text-radial-offset": ["+", ["/", ["get", "pixel_radius"], 12], 0.1],
        },
        paint: {
          "text-color": "dodgerblue",
          "text-halo-color": "#FFFFFF",
          "text-halo-width": 2,
        },
        filter: [
          "any",
          ["get", "is_generalized"],
          ["!", ["get", "correlated"]],
          ["==", ["get", "section_id"], "M"],
        ],
      },
      {
        id: "sections-labels",
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
          "text-color": "black",
          "text-halo-color": "#FFFFFF",
          "text-halo-width": 2,
        },
        filter: [
          "all",
          ["get", "in_strat_model"],
          ["!", ["get", "is_generalized"]],
        ],
      },
    ],
  };

  return mergeStyles(style, sectionsStyle);
}
