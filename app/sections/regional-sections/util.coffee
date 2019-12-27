import {useContext} from 'react'
import {FaciesContext} from '#'

removeLines = (f, niter=1)->
  # Strip the first N lines of text
  for i in [0...niter]
    console.log i
    f = f.substring(f.indexOf("\n") + 1)
  return f

useFaciesColors = ->
  {faciesTracts} = useContext(FaciesContext)
  colorIndex = {}
  for d in faciesTracts
    colorIndex[d.id] = d.color
    if d.abbreviation?
      colorIndex[d.abbreviation] ?= d.color

  return colorIndex

export {removeLines, useFaciesColors}
