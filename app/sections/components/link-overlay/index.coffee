import {
  Component,
  createContext,
  useContext,
  useState,
  useRef,
  useLayoutEffect,
  forwardRef
} from "react"
import T from "prop-types"
import {hyperStyled} from "@macrostrat/hyper"
import classNames from "classnames"
import update from 'immutability-helper'
import {
  expandInnerSize,
  useSettings,
  ColumnContext,
  SVG
} from '#'
import {group, pairs} from 'd3-array'
import {linkHorizontal} from 'd3-shape'
import {Notification} from "../../../notify"
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

SectionPositionProvider = (props)->
  {children} = props
  container = useRef()

  [value, setState] = useState({})

  setPosition = (id, scale, pos, otherProps)->
    el = container.current
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
      return if x == value[id].x and y == value[id].y

    {width: innerWidth, padding, rest...} = otherProps
    return null unless scale?
    [min, max] = scale.range()
    innerHeight = Math.abs(max-min)
    sz = expandInnerSize {innerWidth, innerHeight, padding, rest...}

    globalRange = scale.range().map (d)-> d + y + sz.paddingTop
    globalScale = scale.copy().range(globalRange).clamp(false)

    val = {id,x,y, width, scale,globalScale, sz...}
    spec = {[id]: {$set: val}}
    newValue = update value, spec
    setState newValue

  h 'div.section-positioner', {ref: container}, [
    h SectionPositionContext.Provider, {value: setPosition}, [
      h SectionObserverContext.Provider, {value}, children
    ]
  ]

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

  useLayoutEffect(runPositioner)

  h 'div', {className, ref}, children

ColumnTracker.propTypes = {
  width: T.number
  id: T.string.isRequired
}

withinDomain = (scale, height)->
  d = scale.domain()
  return d[0] < height < d[1]

prepareLinkData = (props)->
  {surfaces, sectionIndex} = props
  return null unless surfaces.length

  ## Deconflict surfaces
  ## The below is a fairly complex way to make sure multiple surfaces
  ## aren't connected in the same stack.
  sectionSurfaces = {}
  for {surface_id, section_height} in surfaces
    continue unless surface_id? # weed out lithostratigraphy for now
    for {section, height, inferred} in section_height
      sectionSurfaces[section] ?= []
      sectionSurfaces[section].push {surface_id, height, inferred}

  # Backdoor way to get section stacks
  vals = Object.values(sectionIndex)
  sectionStacks = group vals, (d)->d.x

  stackSurfaces = []
  sectionStacks.forEach (stackedSections, key)->
    surfacesIndex = {}
    # Logic for determining which section's surface is rendered
    # within a stack (typically the section that is not inferred)

    for section in stackedSections
      {id: section_id} = section
      section_surfaces = sectionSurfaces[section_id] or []
      # Define a function to return domain
      {globalScale} = sectionIndex[section_id]

      # Naive logic
      for surface in section_surfaces
        s1 = surfacesIndex[surface.surface_id]
        if s1?
          # We already have a surface defined
          if withinDomain(globalScale, s1.height)
            if s1.inferred and not section.inferred
              continue
          if not withinDomain(globalScale, surface.height)
            continue
        surfacesIndex[surface.surface_id] = {section: section_id, surface...}
    # Convert to an array
    surfacesArray = (v for k,v of surfacesIndex)
    # Add the pixel height
    for surface in surfacesArray
      {globalScale} = sectionIndex[surface.section]
      surface.y = globalScale(surface.height)
      surface.inDomain = withinDomain(globalScale, surface.height)

    # Save generated index to appropriate stack
    stackSurfaces.push {
      x: parseFloat(key)
      values: surfacesArray
    }

  # Turn back into surface-oriented list
  return surfaces.map (s)->
    id = s.surface_id
    v = {s...}
    return v unless id?
    heights = []
    for {values} in stackSurfaces
      val = values.find (d)->id == d.surface_id
      heights.push(val) if val?
    v.section_height = heights
    return v


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
  {connectLines, surface, stroke, strokeWidth, onClick} = props
  stroke ?= 'black'
  strokeWidth ?= 1
  {section_height, surface_id, unit_commonality,
   type, note} = surface

  values = [section_height...]

  sectionIndex = useContext(SectionObserverContext)

  heights = values.map (v)->
    {section, height, inferred, inDomain} = v
    {globalScale, x: x0, width} = sectionIndex[section]
    return {
      x0
      x1: x0+width
      y: globalScale(height)
      inferred
      inDomain
      section
    }

  heights.sort (a,b)-> a.x0 - b.x0

  return null if heights.length < 2

  pathData = pairs heights, (a,b)->
    inferred = (a.inferred or b.inferred)
    source = {x: a.x1, y: a.y, section: a.section}
    target = {x: b.x0, y: b.y, section: b.section}
    {inDomain} = b
    width = b.x1-b.x0
    {source, target, inferred, width}

  d = null
  links = for pair,i in pathData
    unit_commonality ?= 0
    {inferred,width} = pair
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
      d = "M#{initialX},#{y}"

    linkLine = buildLink(pair)
    if connectLines
      linkLine  =  "L"+linkLine.substring(1)
      linkLine += "l#{width},0"
    else
      linkLine += "M#{width},0"
    d += linkLine

    fill = 'none'

    h 'path', {
      d, className, stroke,
      strokeWidth, fill,
      onClick
      style: {cursor: if onClick then 'pointer' else null}
    }

  if connectLines
    return h 'path', {
      d, className, stroke,
      strokeWidth, fill,
      onClick
      style: {cursor: if onClick then 'pointer' else null}
    }
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

getSize = (sectionIndex)->
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
  return {
    width: w_
    height: h_
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
  {surfaces, showSectionTrackers, connectLines, innerRef, className, rest...} = props
  return null unless surfaces.length

  sectionIndex = useContext(SectionObserverContext)
  sz = getSize(sectionIndex)

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
  ColumnTracker
  prepareLinkData
  useCanvasSize
}
