import {hyperStyled} from '@macrostrat/hyper'
import styles from './main.styl'

h = hyperStyled(styles)

LocationGroup = ({id, name, location, width, children, style, className})->
  name ?= location
  id ?= location
  style ?= {}
  style.width ?= width

  h 'div.location-group', {id, style, className}, [
    h 'h1', null, name
    h 'div.location-group-body', null, children
  ]

LocationGroup.defaultProps = {
  offsetTop: 0
}

export {LocationGroup}
