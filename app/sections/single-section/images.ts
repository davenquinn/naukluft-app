import {useContext} from "react";
import {ColumnContext, extractPadding} from "@macrostrat/column-components";
import {useSection} from "~/sections/data-providers"
import {PlatformContext, Platform} from '~/platform';
import {sum, max} from "d3-array";
import h from "react-hyperscript";
import T from "prop-types";

const ColumnImages = function(props){
  const {sectionID} = props;
  const {zoom, height, pixelsPerMeter, range} = useContext(ColumnContext);
  const {range: sectionRange, imageFiles} = useSection(sectionID);
  const {paddingTop, paddingLeft} = extractPadding(props)
  const imageHeight = sum(imageFiles, d => d.height);
  const imageWidth = max(imageFiles, d => d.width);

  const scaleFactor = imageHeight/height/pixelsPerMeter;
  const zs = zoom/scaleFactor;
  const style = {
    marginTop: paddingTop,
    marginLeft: paddingLeft,
    height: imageHeight*zs,
    width: imageWidth*zs,
    position: 'relative'
  };

  const {platform} = useContext(PlatformContext);

  const getSrc = (im)=>{
    if (platform === Platform.ELECTRON) {
      return "file://"+im.filename;
    } else {
      return im.filename;
    }
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

ColumnImages.propTypes = {
  lithologyWidth: T.number,
  padding: T.object
};

export {ColumnImages};
