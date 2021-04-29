import h from "@macrostrat/hyper"
import {SectionPositionProvider} from './link-overlay'

const SectionContainer = (props)=>{
  const {children, minHeight} = props;
  return h(SectionPositionProvider, [
    h("div#section-page-inner", {
      style: {zoom: 1, minHeight}
    }, children)
  ])
}

export {SectionContainer}
