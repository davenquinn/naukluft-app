import PhotoSwipe from "photoswipe";
import PhotoSwipeUI_Default from "photoswipe/dist/photoswipe-ui-default";
import h from "@macrostrat/hyper";
import { useRef } from "react";

function PhotoGallery() {
  const pswpRef = useRef<PhotoSwipe>(null);
  const ref = useRef<HTMLDivElement>(null);

  const swipe = useMemo(() => {
    return new PhotoSwipe(
      pswpRef.current,
      PhotoSwipeUI_Default,
      this.data.map(getSizeInfo),
      opts,
    );
  }, [pswpRef]);

  return h("div.photo-gallery", { ref });
}
