import h from "@macrostrat/hyper";
import { group } from "d3-array";
import { useQuery } from "naukluft-data-backend";
import React, { createContext, useContext } from "react";

const IsotopesDataContext = createContext({ isotopes: new Map() });

function IsotopesDataProvider(props: React.PropsWithChildren<{}>) {
  const data = useQuery("sections/all-carbon-isotopes") ?? [];

  const isotopes = group(data, (d) => d.section);
  isotopes.forEach((values) => {
    values.sort((a, b) => a.orig_height - b.orig_height);
  });

  return h(
    IsotopesDataContext.Provider,
    { value: { isotopes } },
    props.children,
  );
}

const useIsotopes = () => useContext(IsotopesDataContext).isotopes;

export { IsotopesDataContext, IsotopesDataProvider, useIsotopes };
