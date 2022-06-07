import CesiumView, {
  DisplayQuality,
  buildPositionHash,
  getInitialPosition,
  useCesium,
} from "@macrostrat/cesium-viewer";
import h from "@macrostrat/hyper";
import {
  HillshadeLayer,
  //GeologyLayer,
  SatelliteLayer,
  terrainProvider,
} from "@macrostrat/cesium-viewer/layers";
import { Cesium3DTileset } from "resium";
import { GeologyLayer } from "./vector-style";

const baseURL = process.env.PUBLIC_PATH ?? "/";

function NaukluftCesiumView({
  initialPosition,
  onViewChange,
  showPhotogrammetry = true,
  showGeology = true,
}) {
  return h(
    CesiumView,
    {
      onViewChange,
      onClick({ latitude, longitude, zoom }) {
        console.log(latitude, longitude);
      },
      initialPosition,
      terrainExaggeration: 1,
      displayQuality: DisplayQuality.High,
      //showInspector: true,
      terrainProvider,
    },
    [
      h(Cesium3DTileset, {
        url: baseURL + "tilesets/Neuras/tileset.json",
        //url: IonResource.fromAssetId(75343),
        onReady(tileset) {
          console.log(tileset);
        },
        show: showPhotogrammetry,
        maximumScreenSpaceError: 1,
      }),
      h(SatelliteLayer),
      h(GeologyLayer, { alpha: 0.5, show: showGeology }),
    ]
    //, h(GeologyLayer, { alpha: 0.8 })]
  );
}

export default NaukluftCesiumView;
