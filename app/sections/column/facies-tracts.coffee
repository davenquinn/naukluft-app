import h from '@macrostrat/hyper'
import {ParameterIntervals} from '@macrostrat/column-components'
import {FaciesContext} from '../facies'
import {useContext} from 'react'

FaciesTractIntervals = (props)->
  {faciesTracts} = useContext(FaciesContext)
  map = {}
  console.log(faciesTracts)
  for v in faciesTracts
    map[v.id] = v.color
  console.log map
  h ParameterIntervals, {
    parameter: 'facies_tract'
    fillForInterval: (param)->
      map[param] or 'transparent'
    props...
  }

export {FaciesTractIntervals}
