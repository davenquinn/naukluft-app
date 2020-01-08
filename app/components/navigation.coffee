import h from "@macrostrat/hyper"
import {useHistory} from "react-router"
import {NavLink, BackLink} from "../nav"
import {ButtonGroup, Button} from "@blueprintjs/core"
import T from "prop-types"
import {LinkButton} from '@macrostrat/ui-components'

BackButton = ->
  history = useHistory()
  onClick = -> history.goBack()
  h Button, {
    icon: 'arrow-left',
    size: 24,
    large: true,
    onClick
  }

NavigationControl = (props)->
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

export {BackButton, NavigationControl}
