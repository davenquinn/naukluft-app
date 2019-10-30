import {Component, createContext} from "react"
import h from "react-hyperscript"
import {NavLink, BackLink} from "../nav"
import {Icon} from "@blueprintjs/core"
import T from "prop-types"
import {db, storedProcedure, query} from "./db"

class SectionNavigationControl extends Component
  render: ->
    settings = null
    if @props.toggleSettings
      settings = h 'li', [
        h 'a', onClick: @props.toggleSettings, [
          h Icon, {icon: 'cog', iconSize: 24}
        ]
      ]

    {children} = @props

    h 'ul.controls', [
      h BackLink
      h NavLink, to: '/', [
        h Icon, {icon: 'home', iconSize: 24}
      ]
      settings
      children
    ]

class KnownSizeComponent extends Component
  constructor: (props)->
    super(props)
    Object.defineProperty(@,'width', {get: @__width})
    Object.defineProperty(@,'height', {get: @__height})

  @__width: ->
    return null
  @__height: ->
    return null

export {
  SectionNavigationControl
  KnownSizeComponent
}
