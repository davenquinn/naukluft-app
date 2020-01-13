import {useContext} from "react"
import {ColumnContext} from "@macrostrat/column-components"
import {PlatformContext, Platform} from '../../platform'
import {findDOMNode} from "react-dom"
import {sum, max} from "d3-array"
import {join} from 'path'
import h from "react-hyperscript"
import T from "prop-types"

ColumnImages = (props)->
  {zoom, height, pixelsPerMeter} = useContext(ColumnContext)
  {imageFiles, padding, lithologyWidth, extraSpace} = props
  n = imageFiles.length
  imageHeight = sum imageFiles, (d)->d.height
  imageWidth = max imageFiles, (d)->d.width

  scaleFactor = imageHeight/height/pixelsPerMeter
  zs = zoom/scaleFactor
  style = {
    marginTop: padding.top+extraSpace
    marginLeft: padding.left+lithologyWidth
    height: imageHeight*zs
    width: imageWidth*zs
    position: 'relative'
  }

  {platform} = useContext(PlatformContext)

  if platform == Platform.ELECTRON
    getSrc = (im)->"file://"+im.filename
  else
    getSrc = (im)->
      return im.filename


  h "div.images", {style}, imageFiles.map (im,i)->
    h "img", {
      src: getSrc(im)
      width: im.width*zs
      height: im.height*zs
      style: {
        position: 'absolute'
        top: (427*i)*zs
        left: 0
      }
    }

ColumnImages.defaultProps = {
  extraSpace: 0
}

ColumnImages.propTypes = {
  imageFiles: T.arrayOf(T.object)
  extraSpace: T.number
  lithologyWidth: T.number
  padding: T.object
}

export {ColumnImages}
