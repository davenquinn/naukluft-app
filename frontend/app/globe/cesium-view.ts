import CesiumView, {
  DisplayQuality,
  buildPositionHash,
  getInitialPosition
} from "@macrostrat/cesium-viewer";
import { getHashString, setHashString } from "@macrostrat/ui-components";
import h from "@macrostrat/hyper";
import { useDispatch, useSelector } from "react-redux";
import { queryMap, mapMoved } from "../actions";
import {
  MapChangeTracker,
  MapClickHandler
} from "@macrostrat/cesium-viewer/position";
import {
  HillshadeLayer,
  //GeologyLayer,
  SatelliteLayer,
  terrainProvider
} from "@macrostrat/cesium-viewer/layers";
import { ImageryLayer } from "resium";
import { useMemo } from "react";
import MVTImageryProvider from "mvt-imagery-provider";

/*
import { mapStyle } from "./vector-style";

const GeologyLayer = ({ visibleMaps = null, ...rest }) => {
  const provider = useMemo(() => {
    let prov = new MVTImageryProvider({
      style: mapStyle,
      maximumZoom: 13,
      tileSize: 512
    });
    return prov;
  }, [visibleMaps]);

  return h(ImageryLayer, { imageryProvider: provider, ...rest });
};
*/

const defaultPosition = getInitialPosition({
  a: 314,
  e: 67,
  x: 16.2015,
  y: -24.4099,
  z: 3219
});

const initialPosition = getInitialPosition(getHashString(), defaultPosition);

function NaukluftCesiumView(props) {
  return h(
    CesiumView,
    {
      onViewChange(cpos) {
        setHashString(buildPositionHash(cpos.camera));
      },
      onClick({ latitude, longitude, zoom }) {
        console.log(latitude, longitude);
      },
      initialPosition,
      terrainExaggeration: 1,
      displayQuality: DisplayQuality.High,
      showInspector: false,
      terrainProvider
    },
    [h(HillshadeLayer), h(SatelliteLayer)]
    //, h(GeologyLayer, { alpha: 0.8 })]
  );
}

export default NaukluftCesiumView;
