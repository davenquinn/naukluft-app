import {Component, createContext} from "react"
import h from "@macrostrat/hyper"
import {useHistory} from "react-router"
import {NavLink, BackLink} from "../nav"
import {Icon, ButtonGroup, Button} from "@blueprintjs/core"
import T from "prop-types"
import {LinkButton} from '@macrostrat/ui-components'
import {SVGNamespaces} from '#'
import {db, storedProcedure, query} from "./db"

BackButton = ->
  history = useHistory()
  onClick = -> history.goBack()
  h Button, {
    icon: 'arrow-left',
    size: 24,
    large: true,
    onClick
  }

SectionNavigationControl = (props)->
  {toggleSettings, children} = props
  h ButtonGroup, {className: 'controls'}, [
    h BackButton
    h LinkButton, {to: '/', icon: 'home', large: true}
    h.if(toggleSettings?) Button, {
      onClick: toggleSettings,
      icon: 'cog',
      large: true
    }
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

rangeForSection = (row)->
  {start, end, clip_end} = row
  clip_end ?= end
  [start, clip_end]


export {
  SectionNavigationControl
  KnownSizeComponent
  SVGNamespaces
  rangeForSection
}
