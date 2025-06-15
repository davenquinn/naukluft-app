import h from "@macrostrat/hyper";
import { useMemo, useState } from "react";
import MVTImageryProvider from "mvt-imagery-provider";
import { createMapStyle, emptyStyle } from "@naukluft/map-panel";
import { ImageryLayer } from "resium";
import { useEffect } from "react";

export const GeologyLayer = ({ visibleMaps = null, ...rest }) => {
  const [provider, setProvider] = useState(null);
  useEffect(() => {
    createMapStyle(null, null, { terrain: false, patterns: false }).then(
      (style) => {
        setProvider(
          new MVTImageryProvider({
            style,
            maximumZoom: 16,
            tileSize: 512,
          }),
        );
      },
    );
  }, []);

  if (provider == null) return null;

  return h(ImageryLayer, { imageryProvider: provider, ...rest });
};
