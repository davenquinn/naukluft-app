import { useState, useCallback, useEffect } from "react";
import h from "@macrostrat/hyper";
import { FaciesContext } from "@macrostrat/column-components";
import {
  runQuery,
  useQuery,
  useUpdateableQuery,
  ResultMask,
} from "~/data-backend";

function FaciesProvider(props: any) {
  const { children, ...rest } = props;

  const [colorMap, setColorMap] = useState<{ [k: string]: string }>({});
  const [facies, updateFacies] = useUpdateableQuery("facies/facies");
  const faciesTracts: any[] = useQuery("facies/facies-tracts");
  useEffect(() => {
    let __colorMap = {};
    for (let f of Array.from(facies)) {
      // @ts-ignore
      __colorMap[f.id] = f.color;
    }
    setColorMap(__colorMap);
  }, [facies]);

  const getFaciesColor = useCallback((id) => colorMap[id] || null, [colorMap]);
  const setFaciesColor = useCallback(async (id, color) => {
    await runQuery("facies/set-color", { id, color }, ResultMask.none);
    updateFacies();
  }, []);

  const value = {
    facies,
    faciesTracts,
    getFaciesColor,
    setFaciesColor,
    ...rest,
  };
  return h(FaciesContext.Provider, { value }, children);
}

export { FaciesContext, FaciesProvider };
