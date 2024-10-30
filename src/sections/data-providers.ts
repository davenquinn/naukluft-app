import { getJSON } from "../util";
import useAsyncEffect from "use-async-effect";
import React, { createContext, useContext, useState } from "react";
import { FaciesProvider } from "./facies";
import { LithologyProvider } from "./lithology";
import { PlatformContext } from "../platform";
import { SequenceStratProvider } from "./sequence-strat-context";
import { SectionSurfacesProvider } from "~/sections/providers";
import { PhotoLibraryProvider as BasePhotoLibraryProvider } from "@macrostrat/photo-viewer";
import { ColumnDivisionsProvider } from "./column/data-source";
import { SymbolProvider } from "./components/symbols";
import h, { compose } from "@macrostrat/hyper";
import { IsotopesDataProvider } from "./summary-sections/chemostrat/data-manager";
import { range } from "underscore";

import { fileInfo } from "./section-image-info";

import {
  runQuery,
  useQuery,
  currentPlatform,
  Platform,
} from "naukluft-data-backend";

function join(...args) {
  return args.join("/");
}

// Vite environment variables
const ASSETS_BASE_URL = import.meta.env.VITE_ASSETS_BASE_URL;

const sectionFilename = function (fn) {
  return join(ASSETS_BASE_URL, "column-images", fn);
};

const getSectionData = async function (opts = {}) {
  const config = fileInfo;

  const data = await runQuery("sections/sections");
  return data.map(function (s) {
    s.id = s.section.trim();
    s.range = [s.start, s.end];
    // Height in meters
    s.height = s.end - s.start;

    const files = config[s.id];

    if (files != null) {
      const scaleFactor = files.height / s.height;
      const sz = 427;
      s.scaleFactor = scaleFactor;
      s.imageFiles = range(files.n).map((i) => {
        const filename = sectionFilename(`section_${s.id}_${i + 1}.png`);
        const remaining = files.height - i * sz;
        const height = remaining > sz ? sz : remaining;
        return { width: sz, height, filename };
      });
    }
    return s;
  });
};

const PhotoLibraryProvider = function ({ children }) {
  const { computePhotoPath } = useContext(PlatformContext);
  const photos = useQuery("sections/photo");
  return h(BasePhotoLibraryProvider, { photos, computePhotoPath }, children);
};

const SectionDataContext = createContext<SectionData[]>([]);

function useSectionData() {
  const [sections, setSections] = useState<SectionData[] | null>(null);
  useAsyncEffect(async () => setSections(await getSectionData()), []);
  return sections;
}

const SectionProvider = ({ children }: React.PropsWithChildren<{}>) => {
  const sections = useSectionData();
  if (sections == null) return null;
  return h(SectionDataContext.Provider, { value: sections }, children);
};

const useSection = (id: string): SectionData | null => {
  const sections: SectionData[] = useContext(SectionDataContext);
  return sections.find((d) => d.id == id) ?? null;
};

const SectionDataProvider = compose(
  LithologyProvider,
  ColumnDivisionsProvider,
  SymbolProvider,
  FaciesProvider,
  PhotoLibraryProvider,
  SectionSurfacesProvider,
  SequenceStratProvider,
  IsotopesDataProvider,
  SectionProvider
);

const SectionConsumer = SectionDataContext.Consumer;

export {
  getSectionData,
  useSection,
  SectionDataProvider,
  SectionConsumer,
  SectionDataContext,
};
