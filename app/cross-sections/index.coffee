import sql from './get-terrain.sql'
import {SVG, expandInnerSize} from '#'

import {useQuery} from '~/db'
import {useDarkMode} from '~/platform'
import {NavigationControl} from '~/components'
import {scaleLinear} from 'd3-scale'
import {line} from 'd3-shape'

import {hyperStyled} from '@macrostrat/hyper'
import styles from './main.styl'
h = hyperStyled(styles)

CrossSection = (props)->
  {geometry, heightRange} = props
  {coordinates} = geometry

  metersPerPixel = 10

  scaleHeight = (d)->
    height = d[1]
    heightOffset = heightRange[1]-height
    return heightOffset/metersPerPixel

  innerHeight = (heightRange[1]-heightRange[0])/metersPerPixel
  innerWidth = coordinates[coordinates.length-1][0]/metersPerPixel
  padding = 20

  {width, height} = expandInnerSize({
    innerHeight,
    innerWidth,
    padding
  })

  pathGenerator = line()
    .x (d)->d[0]/metersPerPixel
    .y scaleHeight

  d = pathGenerator(coordinates)

  h SVG, {width, height}, [
    h 'g', {transform: "translate(#{padding},#{padding})"}, [
      h 'path.terrain', {d}
    ]
  ]

CrossSectionsPage = ->
  # State management
  res = useQuery(sql)

  darkMode = useDarkMode()
  className = if darkMode then "dark-mode" else null
  h 'div.cross-sections', {className}, [
    h NavigationControl
    h 'div.inner', res.map (d)->
      {geometry, ymin, ymax} = d
      heightRange = [ymin, ymax]
      h 'div', [
        h 'h3', d.name
        h CrossSection, {geometry, heightRange}
      ]
  ]

export {CrossSectionsPage}
