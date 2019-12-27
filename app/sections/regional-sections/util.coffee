import {useContext} from 'react'
import {FaciesContext} from '#'

useFaciesColors = ->
  {faciesTracts} = useContext(FaciesContext)
  colorIndex = {}
  for d in faciesTracts
    colorIndex[d.id] = d.color
    if d.abbreviation?
      colorIndex[d.abbreviation] ?= d.color

  return colorIndex

export {useFaciesColors}
