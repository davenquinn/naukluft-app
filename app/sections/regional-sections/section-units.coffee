import h from 'react-hyperscript'
import {join} from 'path'
import {select} from 'd3-selection'
import {Component} from 'react'
import {findDOMNode} from 'react-dom'
import {get} from 'axios'
import {SVG} from "@macrostrat/column-components"
import {
  PolygonTopology
  extractLines
  extractTextPositions
  removeLines
} from '../components/polygon-topology'
import {filenameForID} from './svg-export'
import {useFaciesColors} from './util'
import S1 from './sequence-data-edited/S1.svg'
import S2 from './sequence-data-edited/S2.svg'
import S3 from './sequence-data-edited/S3.svg'

fileNames = {S1,S2,S3}

getFile = (id)->
  fn = fileNames[id]
  # encoded as a data URI (Electron-webpack)
  if fn.startsWith("data:image/svg+xml;base64,")
    return atob(fn.split(',')[1])
  # Webpack for S1, for some reason
  else if fn.startsWith("imgs")
    {data} = await get(fn, {responseType: 'text'})
    return data

  try
    {readFileSync} = require('fs')
    svg = readFileSync(fn, 'utf-8')
    return Promise.resolve(svg)
  catch
    return get(fn, {responseType: 'text'})

getEditedSequenceOverlay = (id)->
  svg = await getFile(id)
  console.log(svg)
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
      return '#eeeeee'
  }

class CrossSectionUnits extends Component
  constructor: ->
    super arguments...
    @state = {lines: null, points: null}

  componentDidMount: ->
    @extractTopology()

  extractTopology: =>
    {id} = @props
    console.log(id)
    svg = await getEditedSequenceOverlay(id)
    console.log(svg)
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
