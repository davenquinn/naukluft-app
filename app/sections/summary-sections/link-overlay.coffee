import {Component, createContext, useContext, useState, useEffect, useLayoutEffect} from "react"
import h from "@macrostrat/hyper"
import classNames from "classnames"
import * as d3 from "d3"
import {SVGNamespaces} from "../util"
import {Notification} from "../../notify"
import T from "prop-types"
import update from 'immutability-helper'
import {ColumnContext} from '#/context'
import {expandInnerSize, SVG} from '#'

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

  [value, setState] = useState({})

  setPosition = (id, scale, pos, otherProps)->
    return unless pos?
    return unless scale?
    {x,y} = pos
    if value[id]?
      return if x == value[id].x and y == value[id].y

    {width: innerWidth, padding} = otherProps
    return null unless scale?
    [min, max] = scale.range()
    innerHeight = Math.abs(max-min)
    sz = expandInnerSize {innerWidth, innerHeight, padding}

    globalRange = scale.range().map (d)-> d + y + sz.paddingTop
    globalScale = scale.copy().range(globalRange).clamp(false)

    val = {id,x,y,scale,globalScale, sz...}
    spec = {[id]: {$set: val}}
    newValue = update value, spec
    setState newValue

  h SectionPositionContext.Provider, {value: setPosition}, [
    h SectionObserverContext.Provider, {value}, children
  ]

ColumnTracker = (props)->
  {id, domID, rest...} = props
  domID ?= id
  setPosition = useContext(SectionPositionContext)
  {scale} = useContext(ColumnContext)

  runPositioner = ->
    # Run this code after render
    node = document.getElementById(domID)
    rect = node.getBoundingClientRect()
    setPosition(id, scale, rect, rest)

  useLayoutEffect(runPositioner)
  return null

ColumnTracker.propTypes = {
  width: T.number.isRequired
  id: T.string.isRequired
  domID: T.string
}

prepareLinkData = (props)->
  {skeletal, marginTop,
   showLithostratigraphy, surfaces, sectionIndex} = props
  return null unless surfaces.length
  {triangleBarsOffset} = props

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
  sectionStacks = d3.nest()
    .key (d)->d.x
    .entries (v for k,v of sectionIndex)

  console.log sectionIndex, sectionStacks

  stackSurfaces = []
  for {key, values: stackedSections} in sectionStacks
    surfacesIndex = {}
    # Logic for determining which section's surface is rendered
    # within a stack (typically the section that is not inferred)

    for section in stackedSections
      {id: section_id} = section
      section_surfaces = sectionSurfaces[section_id] or []
      # Define a function to return domain
      withinDomain = (height)->
        {globalScale} = sectionIndex[section_id]
        d = globalScale.domain()
        return d[0] < height < d[1]

      # Naive logic
      for surface in section_surfaces
        s1 = surfacesIndex[surface.surface_id]
        if s1?
          # We already have a surface defined
          if withinDomain(s1.height)
            if s1.inferred and not section.inferred
              continue
          if not withinDomain(surface.height)
            continue
        surfacesIndex[surface.surface_id] = {section: section_id, surface...}
    # Convert to an array
    surfacesArray = (v for k,v of surfacesIndex)
    # Add the pixel height
    for surface in surfacesArray
      {globalScale} = sectionIndex[surface.section]
      surface.y = globalScale(surface.height)
      surface.inDomain = withinDomain(surface.height)

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

class SectionLinkOverlay extends Component
  @contextType: SectionObserverContext
  @defaultProps: {
    width: 100
    height: 100
    paddingLeft: 20
    marginTop: 0
    connectLines: true
    showLithostratigraphy: true
    showCarbonIsotopes: false
    showSectionTrackers: false
  }
  constructor: (props)->
    super props

    @link = d3.linkHorizontal()
      .x (d)->d.x
      .y (d)->d.y

  buildLink: (surface)=>
    {paddingLeft, marginTop,
     showLithostratigraphy, showSequenceStratigraphy
     connectLines
    } = @props
    {section_height, surface_id, unit_commonality,
     type, flooding_surface_order, note} = surface

    values = [section_height...]

    if type == 'lithostrat'
      stroke = '#ccc'
      if not showLithostratigraphy
        return null
    if type == 'sequence-strat'
      {stroke, strokeWidth} = sectionSurfaceProps(surface)
      if not showSequenceStratigraphy
        return null

    onClick = ->
      v = if type == 'lithostrat' then "Lithostratigraphic" else "Sequence-stratigraphic"
      Notification.show {
        message: h 'div', [
          "#{v} surface "
          h 'code', surface_id
          if note? then ": #{note}" else null
        ]
      }

    sectionIndex = @context

    heights = []
    for {section, height, inferred, inDomain} in values
      try
        {globalScale, x: x0, width} = sectionIndex[section]
        console.log section, sectionIndex[section]
        x1 = x0+width
        y = globalScale(height)
        heights.push {x0, x1, y, inferred, inDomain, section}
      catch
        # Not positioned yet (or at all?)
        console.log "No section position computed for #{section}"


    heights.sort (a,b)-> a.x0 - b.x0

    return null if heights.length < 2

    pathData = d3.pairs heights, (a,b)->
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

      if not d?
        initialX = x
        if connectLines
          initialX -= width
        d = "M#{initialX},#{y}"
        if connectLines
          d += "l#{width},0"

      d += @link(pair)
      if connectLines
        d += "l#{width},0"
      else
        d += "M#{width},0"
      fill = 'none'

      h 'path', {d, className, stroke, strokeWidth, fill, onClick}

    h 'g', links

  render: ->
    {surfaces, showSectionTrackers} = @props
    return null unless surfaces.length

    surfacesNew = prepareLinkData({
      @props...,
      sectionIndex: @context
    })

    {width, height} = @props
    h SVG, {
      id: "section-link-overlay",
      width,
      height
    }, [
      h.if(showSectionTrackers) SectionTrackerRects
      h 'g.section-links', surfacesNew.map @buildLink
    ]

export {
  SectionLinkOverlay
  SectionPositionProvider
  SectionPositionContext
  sectionSurfaceProps
  ColumnTracker
  prepareLinkData
}
