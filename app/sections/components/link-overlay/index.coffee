import {
  Component,
  createContext,
  useContext,
  useState,
  useRef,
  useLayoutEffect,
  useEffect,
  forwardRef
} from "react"
import useConstant from 'use-constant'
import T from "prop-types"
import {hyperStyled} from "@macrostrat/hyper"
import classNames from "classnames"
import update from 'immutability-helper'
import {
  expandInnerSize,
  extractPadding,
  removePadding,
  useSettings,
  ColumnContext,
  SVG
} from '@macrostrat/column-components'
import {debounce} from 'underscore'
import {pairs} from 'd3-array'
import {linkHorizontal} from 'd3-shape'
import {Notification} from "~/notify"
import {SectionLinkPath} from './path'
import {prepareLinkData} from './build-links'
import styles from './main.styl'

h = hyperStyled(styles)

sectionSurfaceProps = (surface)->
  {surface_type, surface_order} = surface

  if surface_type == 'mfs'
    stroke = '#ccc'
  else if surface_type == 'sb'
    stroke = '#fcc'
  else
    stroke = '#ccc'

  strokeWidth = 3-Math.pow(surface_order,1.5)*1.5
  if strokeWidth < 1
    strokeWidth = 1
  return {stroke, strokeWidth}

SectionPositionContext = createContext()
SectionObserverContext = createContext({})

class SectionPositionProvider extends Component
  constructor: (props)->
    super props
    @container = null
    @state = {value: {}}
    @spec = null
    @debouncedUpdate = debounce(@update, 200)

  setPosition: (id, scale, pos, otherProps)=>
    {value} = @state
    el = @container
    if el?
      containerPosition = el.getBoundingClientRect()
    else
      containerPosition = {x: 0, y: 0}

    return unless pos?
    return unless scale?

    {x,y, width} = pos
    x -= containerPosition.x
    y -= containerPosition.y

    if value[id]?
      return if x == value[id].x and y == value[id].y and width == value[id].width

    {width: innerWidth, padding, rest...} = otherProps

    [min, max] = scale.range()
    innerHeight = Math.abs(max-min)
    sz = expandInnerSize {innerWidth, innerHeight, padding, rest...}

    globalRange = scale.range().map (d)-> d + y + sz.paddingTop
    globalScale = scale.copy().range(globalRange).clamp(false)

    val = {id,x,y, width, scale,globalScale, sz...}
    @accumulateChanges {[id]: {$set: val}}

  accumulateChanges: (spec)=>
    oldSpec = @spec or {}
    @spec = {oldSpec..., spec...}
    @debouncedUpdate()

  update: =>
    return unless @spec?
    value = update(@state.value, @spec)
    console.log(@spec)
    @spec = null
    @setState {value}

  render: ->
    {children} = @props
    {value} = @state

    h 'div.section-positioner', {ref: (ref)=>@container = ref }, [
      h SectionPositionContext.Provider, {value: @setPosition}, [
        h SectionObserverContext.Provider, {value}, children
      ]
    ]

useSectionPositions = ->
  useContext(SectionObserverContext)

ColumnTracker = (props)->
  ###
  Tracks a column's position and reports
  it back to the SectionObserverContext.
  ###
  {children, className, id, rest...} = props
  setPosition = useContext(SectionPositionContext)
  {scale} = useContext(ColumnContext)

  ref = useRef()

  runPositioner = ->
    return unless ref.current?
    # Run this code after render
    rect = ref.current.getBoundingClientRect()
    setPosition(id, scale, rect, rest)

  useEffect(runPositioner)

  h 'div', {className, ref}, children

ColumnTracker.propTypes = {
  width: T.number
  id: T.string.isRequired
}

# https://www.particleincell.com/2012/bezier-splines/

SectionTrackerRects = (props)->
  sectionPositions = useContext(SectionObserverContext)
  sections = Object.values(sectionPositions)
  h 'g.section-trackers', sections.map (d)->
    {x,y,scale, width, height} = d
    return null unless scale?
    h 'rect.section-tracker', {x,y, width, height, props...}

buildLink = linkHorizontal()
  .x (d)->d.x
  .y (d)->d.y

SectionLink = (props)->
  {
    connectLines,
    surface,
    stroke,
    strokeWidth,
    onClick
  } = props
  stroke ?= 'black'
  strokeWidth ?= 1
  {section_height, surface_id, unit_commonality,
   type, note} = surface

  # CURRENTLY PRIVATE API to allow section gaps to be filled
  # or not when connectLines = false
  fillSectionWidth = true
  __gapCommand = if fillSectionWidth then 'l' else 'M'

  sectionIndex = useContext(SectionObserverContext)

  heights = section_height.map (v)->
    {section, height, inferred, inDomain, certainty} = v
    {globalScale, x: x0, width} = sectionIndex[section]
    return {
      x0
      x1: x0+width
      y: globalScale(height)
      inferred
      inDomain
      section
      certainty
    }

  heights.sort (a,b)-> a.x0 - b.x0

  return null if heights.length < 2

  __LinkPath = (props)->
    h SectionLinkPath, {className, stroke, strokeWidth, onClick, props...}

  pathData = pairs heights, (a,b)->
    inferred = (a.inferred or b.inferred)
    certainty = Math.min((a.certainty or 10), (b.certainty or 10))
    source = {x: a.x1, y: a.y, section: a.section}
    target = {x: b.x0, y: b.y, section: b.section}
    {inDomain} = b
    width = b.x1-b.x0
    {source, target, inferred, certainty, width}

  d = null
  certainty = 10
  links = for pair,i in pathData
    unit_commonality ?= 0
    {inferred,width, certainty} = pair
    className = classNames(
      "section-link"
      type
      {inferred})
    # First move to initial height
    {x,y} = pair.source

    if not connectLines?
      d = null

    if not d?
      initialX = x
      if connectLines
        initialX -= width
      else if fillSectionWidth
        initialX -= width/2
      d = "M#{initialX},#{y}"

    linkLine = buildLink(pair)
    if connectLines or fillSectionWidth
      linkLine  =  "L"+linkLine.substring(1)
      linkLine += "l#{width},0"
    else
      linkLine += "#{__gapCommand}#{width},0"
    d += linkLine

    fill = 'none'

    h __LinkPath, {d, certainty}

  if connectLines
    return h __LinkPath, {d, certainty}
  else
    return h 'g', links

SectionLink.propTypes = {
  connectLines: T.bool
  stroke: T.string
  strokeWidth: T.number
  surface: T.object.isRequired
}

FilteredSectionLink = (props)->
  {type, note, surface_id} = props.surface
  {showLithostratigraphy, showSequenceStratigraphy} = useSettings()
  if type == 'lithostrat'
    stroke = '#ccc'
    strokeWidth = 1
    if not showLithostratigraphy
      return null
  if type == 'sequence-strat'
    {stroke, strokeWidth} = sectionSurfaceProps(props.surface)
    if not showSequenceStratigraphy
      return null

  onClick = ->
    v = if type == 'lithostrat' then "Lithostratigraphic" else "Sequence-stratigraphic"
    Notification.show {
      message: h 'div', [
        "#{v} surface "
        h 'code', surface_id
        h.if(note?) [
          ": #{note}"
        ]
      ]
    }

  h SectionLink, {props..., stroke, strokeWidth, onClick}

getSize = (sectionIndex, padding={})->
  w_ = 0
  h_ = 0
  for k,v of sectionIndex
    {width, height, x, y} = v
    maxX = x+width
    maxY = y+height
    if maxX > w_
      w_ = maxX
    if maxY > h_
      h_ = maxY
  return expandInnerSize {
    innerWidth: w_
    innerHeight: h_
    padding...
  }

useCanvasSize = ->
  sectionIndex = useContext(SectionObserverContext)
  return getSize(sectionIndex)

SectionLinks = (props)->
  {surfaces, connectLines, innerRef} = props
  return null unless surfaces.length
  sectionIndex = useContext(SectionObserverContext)

  surfacesNew = prepareLinkData({
    props...,
    sectionIndex
  })

  h 'g.section-links', surfacesNew.map (surface)->
    h FilteredSectionLink, {surface, connectLines}

SectionLinkOverlay = (props)->
  {
    surfaces,
    showSectionTrackers,
    connectLines,
    innerRef,
    className,
    rest...
  } = props
  return null unless surfaces.length
  padding = extractPadding(rest)

  sectionIndex = useContext(SectionObserverContext)
  sz = getSize(sectionIndex, padding)

  h SVG, {
    # Shouldn't need ID but we apparently do
    className: classNames("section-link-overlay", className)
    innerRef
    sz...
    rest...
  }, [
    h.if(showSectionTrackers) SectionTrackerRects
    h SectionLinks, {connectLines, surfaces}
  ]

SectionLinkOverlay.propTypes = {
}

SectionLinkOverlay.defaultProps = {
  connectLines: true
  showSectionTrackers: false
}

export {
  SectionLinks
  SectionLinkOverlay
  SectionPositionProvider
  SectionPositionContext
  sectionSurfaceProps
  useSectionPositions
  ColumnTracker
  prepareLinkData
  useCanvasSize
}
