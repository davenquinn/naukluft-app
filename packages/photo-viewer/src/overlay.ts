import { useState, useContext } from "react";
import h from "@macrostrat/hyper";
import { PhotoLibraryContext } from "./context";

const PhotoGallery = function (props) {
  const { images, isOpen, onClose, ...rest } = props;
  // We just disable this until we figure it out.
  return null;
  const [ix, setIndex] = useState(0);
  const increment = (step) =>
    function () {
      const newIx = (ix + step) % images.length;
      return setIndex(newIx);
    };

  if (!isOpen) return null;

  return h(Carousel, {
    views: images,
    currentIndex: ix,
    ...rest,
  });
};

function PhotoOverlay(props) {
  // TODO: figure out web error "Cannot find module `fscreen`"
  return null;
  const { photos, computePhotoPath } = useContext(PhotoLibraryContext);
  if (photos == null) {
    return null;
  }
  const { photoIDs, ...rest } = props;

  const displayedPhotos = photoIDs.map((id) => {
    return photos.find((d) => d.id === id);
  });

  const getPaths = function (d) {
    const src = computePhotoPath(d);
    return { src, caption: d.note };
  };

  const images = displayedPhotos.filter((d) => d != null).map(getPaths);

  return h(PhotoGallery, {
    images,
    ...rest,
  });
}

export { PhotoOverlay };
