import h from 'react-hyperscript'
import {readFileSync} from 'fs'
import {join} from 'path'
import {select} from 'd3-selection'
import {Component} from 'react'
import {findDOMNode} from 'react-dom'
import {SVG} from "#"
import {
  PolygonTopology
  extractLines
  extractTextPositions
  removeLines
} from '../components/polygon-topology'
import {filenameForID} from './svg-export'
import {useFaciesColors} from './util'

editedFile = (id)->
  filenameForID(id,'svg').replace("sequence-data", "sequence-data-edited")

getEditedSequenceOverlay = (id)->
  fn = editedFile(id)
  try
    svg = readFileSync fn
  catch
    return null
  fst = removeLines(svg.toString(), 2)

  el = document.createElement("div")
  el.innerHTML = fst

  svg = el.querySelector("svg")
  lyr2 = el.querySelector("#Layer_2")

  return select(svg)

Topology = (props)->
  colorIndex = useFaciesColors()
  h PolygonTopology, {
    props...
    generateFill: (p,i)->
      {facies_id, geometry} = p
      return null unless geometry
      if facies_id?
        return colorIndex[facies_id]
      return 'transparent'
  }

class CrossSectionUnits extends Component
  constructor: ->
    super arguments...
    @state = {lines: null, points: null}

  componentDidMount: ->
    {id} = @props
    svg = getEditedSequenceOverlay(id)
    return unless svg?

    main = svg.select("g#Lines")
    ### Get path data ###
    lines = extractLines(main)

    el = select findDOMNode @

    for v in ['viewBox', 'width', 'height']
      el.attr v, svg.attr(v)

    el.select("g.linework")
      .node().appendChild main.node()

    pts = svg.select("g#Labels").node()
    if pts?
      el.select("g.overlay")
        .node().appendChild(pts)

    ### Get facies data ###
    points = extractTextPositions(svg.select("g#Facies"))

    svg.remove()

    @setState {lines, points}

  render: ->
    {id, rest...} = @props
    {lines, points} = @state
    h SVG, {className: 'cross-section', rest...}, [
      h Topology, {
        lines,
        points
      }
      h 'g.linework'
      h 'g.overlay'
    ]

export {CrossSectionUnits}
