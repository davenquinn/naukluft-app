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

const mapboxToken = import.meta.env.VITE_MAPBOX_API_TOKEN;

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
    padding: 20,
  });

  const transformRequest = useMapboxRequestTransformer(mapboxToken);
  const style = useInsetMapStyle(mapboxToken);

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
        width: 250,
      }),
    ),
  );
}
