import {findDOMNode} from "react-dom"
import {format} from "d3-format"
import {Component, createElement} from "react"
import h from "react-hyperscript"
import {IntervalEditor} from "./modal-editor"
import {Popover, Position} from "@blueprintjs/core"
import {withRouter} from "react-router-dom"
import {ColumnContext} from './context'
import T from 'prop-types'

fmt = format('.1f')

IntervalNotification = (props)->
  {id, height, bottom, top, surface} = props
  h 'div', [
    h 'h4', "Section #{id} @ #{fmt(height)} m"
    h 'p', [
      'Interval ID: '
      h('code', id)
    ]
    h 'p', "#{bottom} - #{top} m"
    if surface then h('p', ["Surface: ", h('code',surface)]) else null
  ]

class DivisionEditOverlay extends Component
  @contextType: ColumnContext
  @propTypes: {
    width: T.number.isRequired
    left: T.number
    top: T.number
    showInfoBox: T.bool
    grainsizeScaleRange: T.arrayOf(T.number)
    onClick: T.func
  }
  @defaultProps: {
    onEditInterval: ->
    onHoverInterval: ->
    onClick: ->
    left: 0
    top: 0
    showInfoBox: false
  }
  constructor: (props)->
    super props
    @state = {
      height: null
      division: null
      popoverIsOpen: false
    }

  onHoverInterval: (event)=>
    # findDOMNode might be slow but I'm not sure
    return unless findDOMNode(@) == event.target

    {pixelHeight, divisions} = @context
    {top} = event.target.getBoundingClientRect()

    height = @heightForEvent(event)
    division = null
    for d in divisions
      if d.bottom < height < d.top
        division = d
        break

    @setState {division}
    event.stopPropagation()

  heightForEvent: (event)=>
    {scale} = @context
    {offsetY} = event.nativeEvent
    return scale.invert(offsetY)

  onEditInterval: (event)=>
    # This could be moved to the actual interval
    # wrapped with a withRouter
    {history, showInfoBox} = @props
    {division} = @state
    height = @heightForEvent(event)
    if event.shiftKey and showInfoBox
      @setState {popoverIsOpen: true}
      return
    @props.onClick({height, division})

  renderEditBoxInner: =>
    h 'div.edit-box', {
      onClick: @onEditInterval
      style: {
        width: '100%'
        height: '100%'
        backgroundColor: "rgba(255,0,0,0.5)"
        cursor: "pointer"
      }
    }

  renderEditBox: =>
    {divisions, pixelHeight, width} = @context
    {popoverIsOpen, division} = @state
    {width, left, top, grainsizeScaleRange} = @props
    isOpen = popoverIsOpen and division?

    {scale, pixelHeight, grainsizeScale, grainsizeForDivision} = @context
    return h('div') unless division?

    top = scale(division.top)
    bottom = scale(division.bottom)
    height = bottom-top

    # This is kind of a silly way to do things
    # Probably should use some type of nested context
    if grainsizeScaleRange?
      xScale = grainsizeScale(grainsizeScaleRange)
      width = xScale(grainsizeForDivision(division))

    style = {
      position: 'absolute'
      top
      height
      left: 0
      width
    }

    h 'div.edit-box-outer', {style}, [
      @renderEditBoxInner()
      h Popover, {
        isOpen
        style: {display: 'block', width}
        position: Position.LEFT
      }, [
        h 'span'
        @renderIntervalEditor()
      ]
    ]

  renderIntervalEditor: =>
    {division} = @state
    return null unless division?
    h IntervalEditor, {
      interval: division
      height: division.height
      section: division.id
      onUpdate: @onIntervalUpdated
      #onPrev: @hoverAdjacent(-1)
      #onNext: @hoverAdjacent(1)
      onClose: => @setState {popoverIsOpen: false}
    }

  render: ->
    {divisions, pixelHeight, width} = @context
    {popoverIsOpen, division} = @state
    {width, left, top} = @props

    h 'div.edit-overlay', {
      style: {
        width
        left
        top
        height: pixelHeight
        position: 'absolute'
        zIndex: 100
        pointerEvents: 'all'
        cursor: 'pointer'
      }
      onMouseEnter: @onHoverInterval
      onMouseMove: @onHoverInterval
      onMouseLeave: =>@setState {division: null}
    }, @renderEditBox()

export {DivisionEditOverlay}