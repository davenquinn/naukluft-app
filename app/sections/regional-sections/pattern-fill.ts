import h from '@macrostrat/hyper'
import {GeologicPattern} from '@macrostrat/column-components'

const FillPatternDefs = (props)=>{
  const {patterns, prefix} = props
  return h('defs', patterns.map((id, i)=>{
    let sz = 100;
    return h(GeologicPattern, {
      key: i, id: `${id}`, prefix,
      width: sz, height: sz
    })
  }))
}

export {FillPatternDefs}
