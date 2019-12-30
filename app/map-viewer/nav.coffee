import {Component} from "react"
import h from "react-hyperscript"
import {NavLink, BackLink} from "../nav"
import {Icon} from "@blueprintjs/core"

class MapNavigationControl extends Component
  render: ->
    settings = null
    if @props.toggleLegend
      settings = h 'li', [
        h 'a', onClick: @props.toggleLegend, [
          h Icon, {icon: 'info-sign', size: 24}
        ]
      ]
    {children} = @props

    homeLink = null
    try
      h NavLink, to: '/', [
        h Icon, {icon: 'home', size: 24}
      ]
    catch
      {}


    h 'ul.controls', [
      homeLink
      settings
      children
    ]


export {MapNavigationControl}
