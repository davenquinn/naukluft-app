import { useContext } from "react";
import { ColumnContext } from "@macrostrat/column-components";
import { useSection } from "~/sections/data-providers";
import { sum, max } from "d3-array";
import T from "prop-types";
import { hyperStyled } from "@macrostrat/hyper";
import { extractPadding } from "@macrostrat/ui-components";
import styles from "./main.module.styl";

const h = hyperStyled(styles);

const ColumnImages = function (props) {
  const { sectionID } = props;
  let { height } = useContext(ColumnContext);
  const { zoom, pixelsPerMeter, range } = useContext(ColumnContext);
  const { range: sectionRange, imageFiles } = useSection(sectionID);
  const { paddingTop, paddingLeft } = extractPadding(props);
  const imageHeight = sum(imageFiles, (d) => d.height);
  const imageWidth = max(imageFiles, (d) => d.width);
  const sectionHeight = sectionRange[1] - sectionRange[0];

  let offsetTop = 0;
  if (range != sectionRange) {
    // For cutouts of small portions of columns
    height = range[1] - range[0];
    offsetTop = sectionRange[1] - range[1];
  }

  const externalScaleFactor = pixelsPerMeter * zoom;
  const internalScaleFactor = imageHeight / sectionHeight / pixelsPerMeter;
  const zs = zoom / internalScaleFactor;
  const style = {
    //marginTop: paddingTop,
    marginLeft: paddingLeft,
    height: height * externalScaleFactor,
    width: imageWidth * zs,
    position: "relative",
  };

  //const pixelOffset = offsetTop

  const top = offsetTop * externalScaleFactor;
  const bottom = top + height * externalScaleFactor;

  const styleInner = {
    marginTop: -top,
    height: imageHeight * zs,
  };

  const getSrc = (im) => {
    return im.filename;
  };

  const imHeight = 427 * zs;

  return h("div.image-container", { style }, [
    h(
      "div.images",
      { style: styleInner },
      imageFiles.map((im, i) => {
        const pos = imHeight * i;
        const src = getSrc(im);
        if (pos < top - imHeight) return null;
        if (pos > bottom) return null;
        return h("img", {
          src,
          width: im.width * zs,
          style: {
            position: "absolute",
            top: pos,
            left: 0,
            maxHeight: imHeight,
          },
        });
      }),
    ),
  ]);
};

ColumnImages.propTypes = {
  lithologyWidth: T.number,
  padding: T.object,
};

export { ColumnImages };
