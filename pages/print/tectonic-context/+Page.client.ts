import hyper from "@macrostrat/hyper";
import { InsetMap, useSectionsStyle } from "~/sections/summary-sections/map";
import { useInsetMapStyle } from "@macrostrat/static-map-utils";
import { useQuery } from "naukluft-data-backend";
import { mergeStyles } from "@macrostrat/mapbox-utils";
import { PrintArea } from "~/shared/print-area";
import styles from "./main.module.styl";
import { Legend } from "./legend";
import { PlatformProvider } from "~/platform";

const h = hyper.styled(styles);

const mapboxToken = import.meta.env.VITE_MAPBOX_API_TOKEN;

const bounds = [15.9, -24.48, 16.5, -23.78];
//const bounds = [15.836, -24.564, 16.386, -24.126];

export function Page() {
  const metersPerPixel = 140;
  const style = useTectonicStyle(metersPerPixel);
  return h(
    PlatformProvider,
    {
      environment: "print",
    },
    h(
      PrintArea,
      { filename: "tectonic-context.pdf" },
      h("div.sections-map", [
        h(
          InsetMap,
          {
            style,
            metersPerPixel,
            className: "tectonic-context-map",
            bounds,
            scalebarWidth: 150,
            scalebarLabelPosition: "bottom",
          },
          h(Legend),
        ),
      ]),
    ),
  );
}

function useTectonicStyle(metersPerPixel) {
  // Placeholder for style fetching logic
  const map = useQuery("map-data/generalized-map");

  const style = useInsetMapStyle(mapboxToken);

  const sectionsStyle = useSectionsStyle({ metersPerPixel, color: "black" });

  if (style == null || map == null || sectionsStyle == null) return null;

  // Build style for generalized sections
  const tectonicMapStyle = {
    glyphs: "mapbox://fonts/openmaptiles/{fontstack}/{range}.pbf",
    sources: {
      generalized: {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: map,
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
        id: "nnc-boundary",
        type: "line",
        source: "generalized",
        paint: {
          "line-color": "#000",
          "line-width": 2,
        },
        filter: ["==", ["get", "unit_id"], "nnc"],
      },
      {
        id: "nnc-boundary-symbols",
        type: "symbol",
        source: "generalized",
        layout: {
          "symbol-placement": "line",
          "symbol-spacing": 15,
          "icon-image": "line-symbol:thrust-fault:black",
          "icon-size": 0.8,
          "icon-rotation-alignment": "map",
          "icon-allow-overlap": true,
          "icon-rotate": 180,
        },
        filter: ["==", ["get", "unit_id"], "nnc"],
      },
    ],
  };

  return mergeStyles(style, tectonicMapStyle, sectionsStyle);
}
