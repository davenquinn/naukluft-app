import { createContext } from "react";
import h from "@macrostrat/hyper";

// Default value for computePhotoPath
const computePhotoPath = (src: string) => src;

interface PhotoLibraryCtx {
  photos: Photo[];
  computePhotoPath?(src: string): string;
}

const PhotoLibraryContext = createContext<PhotoLibraryCtx>({
  photos: [],
  computePhotoPath,
});

interface Photo {
  src: string;
  caption?: string;
}

function PhotoLibraryProvider(props: React.PropsWithChildren<PhotoLibraryCtx>) {
  const { children, ...rest } = props;
  return h(PhotoLibraryContext.Provider, { value: rest, children });
}

export { PhotoLibraryProvider, PhotoLibraryContext };
