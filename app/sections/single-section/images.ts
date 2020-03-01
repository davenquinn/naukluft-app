import {useContext} from "react";
import {ColumnContext, extractPadding} from "@macrostrat/column-components";
import {useSection} from "~/sections/data-providers"
import {PlatformContext, Platform} from '~/platform';
import {sum, max} from "d3-array";
import T from "prop-types";
import {hyperStyled} from '@macrostrat/hyper'
import styles from './main.styl'

const h = hyperStyled(styles)

const ColumnImages = function(props){
  const {sectionID} = props;
  let {height} = useContext(ColumnContext)
  const {platform} = useContext(PlatformContext);
  const {zoom, pixelsPerMeter, range} = useContext(ColumnContext);
  const {range: sectionRange, imageFiles} = useSection(sectionID);
  const {paddingTop, paddingLeft} = extractPadding(props)
  const imageHeight = sum(imageFiles, d => d.height);
  const imageWidth = max(imageFiles, d => d.width);
  const sectionHeight = sectionRange[1]-sectionRange[0]

  let offsetTop = 0
  if (range != sectionRange) {
    // For cutouts of small portions of columns
    height = range[1]-range[0]
    offsetTop = sectionRange[1]-range[1]
  }

  const externalScaleFactor = pixelsPerMeter*zoom
  const internalScaleFactor = imageHeight/sectionHeight/pixelsPerMeter;
  const zs = zoom/internalScaleFactor;
  const style = {
    marginTop: paddingTop,
    marginLeft: paddingLeft,
    height: height*externalScaleFactor,
    width: imageWidth*zs,
    position: 'relative'
  };

  //const pixelOffset = offsetTop

  const styleInner = {
    marginTop: -offsetTop*externalScaleFactor,
    height: imageHeight*zs
  }

  const getSrc = (im)=>{
    if (platform === Platform.ELECTRON) {
      return "file://"+im.filename;
    } else {
      return im.filename;
    }
  }

  return h("div.image-container", {style}, [
    h("div.images", {style: styleInner}, imageFiles.map((im, i) => {
      return h("img", {
        src: getSrc(im),
        width: im.width*zs,
        height: im.height*zs,
        style: {
          position: 'absolute',
          top: (427*i)*zs,
          left: 0
        }
      })
    }))
  ]);
};

ColumnImages.propTypes = {
  lithologyWidth: T.number,
  padding: T.object
};

export {ColumnImages};
