import CesiumView, {
  DisplayQuality,
  buildPositionHash,
  getInitialPosition,
  useCesium
} from "@macrostrat/cesium-viewer";
import h from "@macrostrat/hyper";
import { IonResource, Ion } from "cesium";
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
import { Cesium3DTileset } from "resium";
import { useMemo } from "react";
import MVTImageryProvider from "mvt-imagery-provider";
import { useEffect } from "react";

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

// function NeurasCesiumTileset() {
//   const { viewer } = useCesium();
//   //   console.log("Adding 3d tileset", viewer);
//     var tileset = viewer?.scene.primitives.add(
//       new Cesium3DTileset({
//         url: "http://localhost:3002/tilesets/Neuras/tileset.json"
//       })
//     );
//   }, [viewer]);

//   return null;
// }

function NaukluftCesiumView({
  initialPosition,
  onViewChange,
  showPhotogrammetry = true
}) {
  return h(
    CesiumView,
    {
      onViewChange,
      onClick({ latitude, longitude, zoom }) {
        console.log(latitude, longitude);
      },
      initialPosition,
      //terrainExaggeration: 1,
      //displayQuality: DisplayQuality.High,
      //showInspector: true,
      terrainProvider
    },
    [
      h(Cesium3DTileset, {
        url: "http://localhost:3002/tilesets/Neuras/tileset.json",
        //url: IonResource.fromAssetId(75343),
        onReady(tileset) {
          console.log(tileset);
        },
        show: showPhotogrammetry,
        maximumScreenSpaceError: 1
      }),
      //h(HillshadeLayer),
      h(SatelliteLayer)
    ]
    //, h(GeologyLayer, { alpha: 0.8 })]
  );
}

export default NaukluftCesiumView;
