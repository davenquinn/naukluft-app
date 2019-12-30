import sql from './get-terrain.sql'
import {SVG} from '#'

import {useQuery} from '~/db'
import {useDarkMode} from '~/platform'
import {NavigationControl} from '~/components'

import {hyperStyled} from '@macrostrat/hyper'
import styles from './main.styl'
h = hyperStyled(styles)

CrossSection = (props)->
  h SVG

CrossSectionsPage = ->
  # State management
  res = useQuery(sql)

  darkMode = useDarkMode()
  className = if darkMode then "dark-mode" else null
  h 'div.cross-sections', {className}, [
    h NavigationControl
    h 'div.inner', res.map (d)->
      h 'div', [
        h 'h3', d.name
        h CrossSection
      ]
  ]

export {CrossSectionsPage}
