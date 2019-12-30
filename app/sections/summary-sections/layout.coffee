import {hyperStyled} from '@macrostrat/hyper'
import {Component} from 'react'
import styles from './main.styl'

h = hyperStyled(styles)

class LocationGroup extends Component
  @defaultProps: {
    offsetTop: 0
  }
  render: ->
    {id, name, location, width,
     children, style, className} = @props
    name ?= location
    id ?= location
    style ?= {}
    style.width ?= width
    h 'div.location-group', {id, style, className}, [
      h 'h1', {}, name
      h 'div.location-group-body', {}, children
    ]

export {LocationGroup}
