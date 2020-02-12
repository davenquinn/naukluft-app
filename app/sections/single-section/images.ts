/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import {useContext} from "react";
import {ColumnContext} from "@macrostrat/column-components";
import {PlatformContext, Platform} from '../../platform';
import {findDOMNode} from "react-dom";
import {sum, max} from "d3-array";
import {join} from 'path';
import h from "react-hyperscript";
import T from "prop-types";

const ColumnImages = function(props){
  let getSrc;
  const {zoom, height, pixelsPerMeter} = useContext(ColumnContext);
  const {imageFiles, padding, lithologyWidth, extraSpace} = props;
  const n = imageFiles.length;
  const imageHeight = sum(imageFiles, d => d.height);
  const imageWidth = max(imageFiles, d => d.width);

  const scaleFactor = imageHeight/height/pixelsPerMeter;
  const zs = zoom/scaleFactor;
  const style = {
    marginTop: padding.top+extraSpace,
    marginLeft: padding.left+lithologyWidth,
    height: imageHeight*zs,
    width: imageWidth*zs,
    position: 'relative'
  };

  const {platform} = useContext(PlatformContext);

  if (platform === Platform.ELECTRON) {
    getSrc = im => "file://"+im.filename;
  } else {
    getSrc = im => im.filename;
  }


  return h("div.images", {style}, imageFiles.map((im, i) => h("img", {
    src: getSrc(im),
    width: im.width*zs,
    height: im.height*zs,
    style: {
      position: 'absolute',
      top: (427*i)*zs,
      left: 0
    }
  })));
};

ColumnImages.defaultProps = {
  extraSpace: 0
};

ColumnImages.propTypes = {
  imageFiles: T.arrayOf(T.object),
  extraSpace: T.number,
  lithologyWidth: T.number,
  padding: T.object
};

export {ColumnImages};
