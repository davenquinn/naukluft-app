import {Component} from "react"
import h from "@macrostrat/hyper"
import {LinkButton} from '@macrostrat/ui-components'
import {SVGNamespaces} from '#'
import {NavigationControl as SectionNavigationControl} from '~/components'

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
