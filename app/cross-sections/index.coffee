import sql from './get-terrain.sql'
import {useQuery} from '~/db'
import {SVG} from '#'

import {hyperStyled} from '@macrostrat/hyper'
import styles from './main.styl'
h = hyperStyled(styles)

CrossSection = (props)->
  h SVG

CrossSectionsPage = ->
  # State management
  res = useQuery(sql)

  h 'div.cross-sections', res.map (d)->
    h 'div', [
      h 'h3', d.name
      h CrossSection
    ]

export {CrossSectionsPage}
