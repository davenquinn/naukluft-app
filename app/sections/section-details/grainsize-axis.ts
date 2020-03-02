import {useEffect, useContext, useRef} from "react";
import h from "react-hyperscript";
import {select} from "d3-selection";
import {axisBottom} from 'd3-axis';
import {ColumnLayoutContext} from '@macrostrat/column-components/dist/esm/context/layout'

const GrainsizeAxis = (props)=>{
  const ref = useRef();
  const {grainsizeScale: gs, pixelHeight} = useContext(ColumnLayoutContext);
  if (gs == null) {
    throw "GrainsizeFrame must be a child of a GrainsizeScaleProvider";
  }

  const createAxis = ()=>{
    const ax = axisBottom(gs)
    select(ref.current).call(ax)
  }

  useEffect(createAxis, [ref])

  return h('g.axis.grainsize-axis', {transform: `translate(0 ${pixelHeight})`})
}

export {GrainsizeAxis}
