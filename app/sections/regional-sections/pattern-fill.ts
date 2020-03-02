import h from '@macrostrat/hyper'
import {GeologicPattern} from '@macrostrat/column-components'
import {createContext, useContext} from 'react'

const PatternPrefixContext = createContext<string>("pattern")

const FaciesPattern = (props)=>{
  const prefix = useContext(PatternPrefixContext)
  const {facies, id, size, ...rest} = props
  return h(GeologicPattern, {
    id, prefix, name: facies,
    width: size, height: size,
    ...rest
  })
}
FaciesPattern.defaultProps = {size: 100}

const FillPatternDefs = (props)=>{
  const {patterns, prefix} = props

  return h(PatternPrefixContext.Provider, {value: prefix}, [
    h('defs', [
      h(FaciesPattern, {
        facies: 'p',
        id: '230-C',
        patternTransform: "rotate(90)"
      }),
      h(FaciesPattern, {
        facies: 'sh',
        id: '114-C'
      }),
      h(FaciesPattern, {
        facies: 'or',
        id: '105-C',
        size: 60
      }),
      h(FaciesPattern, {facies: 'mc', id: '431-C', patternTransform: 'rotate(60)'}),
      h(FaciesPattern, {facies: 'cc', id: '121-K', size: 50}),
      h(FaciesPattern, {facies: 'fc', id: '230-K', patternTransform: 'rotate(90)'})
    ])
  ])
}

export {FillPatternDefs}
