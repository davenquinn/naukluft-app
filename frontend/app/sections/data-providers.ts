import { getJSON } from "../util";
import { join, resolve } from "path";
import useAsyncEffect from "use-async-effect";
import React, { createContext, useContext, useState } from "react";
import { FaciesProvider } from "./facies";
import { LithologyProvider } from "./lithology";
import { PlatformContext } from "../platform";
import { SequenceStratProvider } from "./sequence-strat-context";
import { SectionSurfacesProvider } from "~/sections/providers";
import { PhotoLibraryProvider as BasePhotoLibraryProvider } from "@macrostrat/column-components";
import { ColumnDivisionsProvider } from "./column/data-source";
import { SymbolProvider } from "./components/symbols";
import h, { compose } from "@macrostrat/hyper";
import { IsotopesDataProvider } from "./summary-sections/chemostrat/data-manager";
import "./main.styl";
import {
  runQuery,
  useQuery,
  currentPlatform,
  Platform
} from "naukluft-data-backend";

const sectionFilename = function(fn) {
  if (currentPlatform == Platform.ELECTRON) {
    return resolve(__dirname, "..", "..", "..", "data", "column-images", fn);
  } else {
    return join(BASE_URL, "section-images", fn);
  }
};

function __range__(left, right, inclusive) {
  let range = [];
  let ascending = left < right;
  let end = !inclusive ? right : ascending ? right + 1 : right - 1;
  for (let i = left; ascending ? i < end : i > end; ascending ? i++ : i--) {
    range.push(i);
  }
  return range;
}

const getSectionData = async function(opts = {}) {
  if (opts.verbose == null) {
    opts.verbose = false;
  }
  const fn = sectionFilename("file-info.json");
  const config = (await getJSON(fn)) ?? {};

  const data = await runQuery("sections/sections");
  return data.map(function(s) {
    s.id = s.section.trim();
    const files = config[s.id] ?? [];
    s.range = [s.start, s.end];
    // Height in meters
    s.height = s.end - s.start;

    const scaleFactor = files.height / s.height;
    if (opts.verbose) {
      console.log(`Section ${s.id} scale factor: ${scaleFactor} px/m`);
    }

    const sz = 427;
    s.scaleFactor = scaleFactor;
    s.imageFiles = __range__(1, files.n, true).map(function(i) {
      const filename = sectionFilename(`section_${s.id}_${i}.png`);
      const remaining = files.height - (i - 1) * sz;
      const height = remaining > sz ? sz : remaining;
      return { width: sz, height, filename };
    });
    return s;
  });
};

const PhotoLibraryProvider = function({ children }) {
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
  return sections.find(d => d.id == id) ?? null;
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
  SectionDataContext
};
