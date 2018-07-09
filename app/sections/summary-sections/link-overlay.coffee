{Component, createContext} = require 'react'
h = require 'react-hyperscript'
classNames = require 'classnames'
d3 = require 'd3'
{SVGNamespaces} = require '../util'
{Notification} = require '../../notify'
{SectionOptionsContext} = require './options'

sectionSurfaceProps = (surface)->
    {flooding_surface_order} = surface
    stroke = if flooding_surface_order > 0 then '#aaa' else '#faa'
    strokeWidth = 6-Math.abs(flooding_surface_order)
    return {stroke, strokeWidth}

OverlayContext = createContext {
  sectionPositions: []
  onResize: ->
}

# https://www.particleincell.com/2012/bezier-splines/

class SectionLinkOverlay extends Component
  @defaultProps: {
    width: 100
    height: 100
    paddingLeft: 20
    marginTop: 0
    showLithostratigraphy: true
    showCarbonIsotopes: false
    sectionOptions: {}
  }
  constructor: (props)->
    super props

    @link = d3.linkHorizontal()
      .x (d)->d.x
      .y (d)->d.y

  buildLink: (surface)=>
    {sectionPositions, paddingLeft, marginTop,
     showLithostratigraphy, showSequenceStratigraphy
     showCarbonIsotopes} = @props
    {section_height, surface_id, unit_commonality, type, flooding_surface_order, note} = surface

    values = [section_height...]
    if showCarbonIsotopes
      v = section_height.find (d)->d.section == 'J'
      if v?
        {section, rest...} = v
        values.push {section: 'carbon-isotopes', rest...}

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

    {triangleBarsOffset, width} = @props.sectionOptions
    heights = []
    for {section, height, inferred} in values
      try
        {bounds, padding, scale, pixelOffset
         triangleBarRightSide
         triangleBarsOffset} = sectionPositions[section]
        triangleBarRightSide ?= false
      catch
        # Not positioned yet (or at all?)
        continue
      yOffs = scale(height)+pixelOffset+2
      y = yOffs
      {left: x0, width} = bounds
      x0 += 55
      x1 = x0+width-40
      ofs = triangleBarsOffset - 10
      if triangleBarRightSide
        x0 -= ofs
        x1 -= ofs


      heights.push {x0, x1, y, inferred}

    heights.sort (a,b)-> a.x0 - b.x0

    return null if heights.length < 2

    pathData = d3.pairs heights, (a,b)->
      inferred = (a.inferred or b.inferred)
      source = {x: a.x1, y: a.y}
      target = {x: b.x0, y: b.y}
      {source, target, inferred}

    links = for pair in pathData
      {inferred} = pair
      className = classNames(
        "section-link"
        "commonality-#{unit_commonality}"
        type
        {inferred})
      d = @link(pair)
      h 'path', {d, className, stroke, strokeWidth, onClick}

    h 'g', links

  render: ->
    {skeletal, sectionPositions, marginTop,
     showLithostratigraphy, surfaces} = @props
    return null unless surfaces.length
    {triangleBarsOffset} = @props.sectionOptions

    className = classNames {skeletal}

    __ = []
    for key, {bounds, padding} of sectionPositions
      {left, top, width, height} = bounds
      sectionPositions[key].key = key
      continue unless left?
      x = left+triangleBarsOffset
      y = top+padding.top-marginTop
      width -= (padding.left+padding.right)
      height -= (padding.top+padding.bottom)
      __.push h 'rect.section-tracker', {key, x,y,width, height}

    ## Deconflict surfaces
    ## The below is a fairly complex way to make sure multiple surfaces
    ## aren't connected in the same stack.
    for {surface_id, section_height} in surfaces
      continue unless surface_id? # weed out lithostratigraphy for now
      for {section, height, inferred} in section_height
        sectionPositions[section].surfaces ?= []
        sectionPositions[section].surfaces.push {surface_id, height, inferred}

    # Backdoor way to get section stacks
    sectionStacks = d3.nest()
      .key (d)->d.bounds.left
      .entries (v for k,v of sectionPositions)

    stackSurfaces = []
    for {key, values: _} in sectionStacks
      surfacesIndex = {}
      # Logic for determining which section's surface is rendered
      # within a stack

      for section in _

        # Define a function to return domain
        withinDomain = (height)->
          d = section.scale.domain()
          return d[0] < height < d[1]
        {key: section_id, surfaces: section_surfaces} = section
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
      surfacesIndex = (v for k,v of surfacesIndex)
      # Add the pixel height
      for surface in surfacesIndex
        {scale, pixelOffset} = sectionPositions[surface.section]
        surface.y = scale(surface.height)+pixelOffset+2

      # Save generated index to appropriate stack
      stackSurfaces.push {
        x: parseFloat(key)
        values: surfacesIndex
      }

    # Turn back into surface-oriented list
    surfacesNew = surfaces.map (s)->
      id = s.surface_id
      v = {s...}
      return v unless id?
      heights = []
      for {values} in stackSurfaces
        val = values.find (d)->id == d.surface_id
        heights.push(val) if val?
      v.section_height = heights
      return v

    {width, height} = @props
    style = {top: marginTop}
    h 'svg#section-link-overlay', {
      SVGNamespaces...
      className, width, height, style}, [
      h 'g.section-trackers', __
      h 'g.section-links', surfacesNew.map @buildLink
    ]

class SectionLinkHOC extends Component
  render: ->
    h SectionOptionsContext.Consumer, null, (sectionOptions)=>
      h SectionLinkOverlay, {sectionOptions, @props...}

module.exports = {SectionLinkOverlay: SectionLinkHOC, sectionSurfaceProps}

