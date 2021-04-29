import {useContext, useRef} from "react";
import h from "react-hyperscript";
import {ColumnLayoutContext} from '@macrostrat/column-components/dist/esm/context/layout'
import {AxisBottom} from '@vx/axis';

const GrainsizeAxis = (props)=>{
  const ref = useRef();
  const {grainsizeScale: gs, pixelHeight} = useContext(ColumnLayoutContext);
  if (gs == null) {
    throw "GrainsizeFrame must be a child of a GrainsizeScaleProvider";
  }

  const majorTicks = ['ms', 'f', 'c ', 'p']

  return h('g.axis.grainsize-axis', {
    transform: `translate(0 ${pixelHeight})`
  }, [
    h(AxisBottom, {
      scale: gs,
      tickLength: 4,
      tickFormat(t) {
        return majorTicks.includes(t) ? t : ""
      }
    })
  ])
}

export {GrainsizeAxis}
