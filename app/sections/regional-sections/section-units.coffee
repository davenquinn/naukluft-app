import h from 'react-hyperscript'
import {readFileSync} from 'fs'
import {join} from 'path'
import {select} from 'd3-selection'
import {Component} from 'react'
import {findDOMNode} from 'react-dom'
import {SVG} from "#"
import {geoPath, geoTransform} from 'd3-geo'
import {db, storedProcedure} from '../db'
import sql from '../regional-cross-section/sql/get-generalized.sql'

import {PolygonComponent} from '../regional-cross-section'
import {filenameForID} from './svg-export'
import {removeLines} from './util'

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

removeALine = (f)->
  f.substring(f.indexOf("\n") + 1)

coordAtLength = (path, pos)->
  {x,y} = path.getPointAtLength(pos)
  x = Math.round(x*10)/10
  y = Math.round(y*10)/10
  [x,y]

proj = geoTransform {
  point: (px, py)-> @stream.point(px, py)
}
generator = geoPath().projection proj

facies_ix = {
  shale: [620, '#DCEDC8']
  gs: [627, '#4A148C']
  ms: [642, '#BBDEFB']
  cc: [601,'#006064']
  fc: [669,'#4DB6AC']
}

class CrossSectionUnits extends Component
  constructor: ->
    super arguments...
    @state = {polygons: null}

  componentDidMount: ->
    {id} = @props
    svg = getEditedSequenceOverlay(id)
    return unless svg?
    pathData = []

    main = svg.select("g#Lines")

    ### Get path data ###
    main.selectAll 'path,line,polygon,polyline'
      .each ->
        len = @getTotalLength()
        return if len == 0
        pos = 0
        coordinates = []
        while pos < len
          coordinates.push coordAtLength(@,pos)
          pos += 0.1
        coordinates.push coordAtLength(@,len)
        pathData.push coordinates

    el = select findDOMNode @
    console.log el, main.node()
    cs = el.select("svg.cross-section")
      .attr "viewBox", svg.attr("viewBox")
    cs.select("g.linework")
      .node().appendChild main.node()

    pts = svg.select("g#Labels")
    cs.select("g.overlay")
      .node().appendChild(pts.node())

    ### Get facies data ###
    points = []
    facies = svg.select("g#Facies")
    facies.selectAll 'text'
      .each ->
        faciesID = select(@).text()
        {x,y,width,height} = @getBBox()
        console.log y,height
        {e,f} = @transform.baseVal[0].matrix
        loc = [e+x+width/2,f+y+height/2]
        geometry = {coordinates: loc, type: "Point"}
        points.push {type: 'Feature', id: faciesID, geometry}

    svg.remove()

    @getPolygons(pathData, points)

  getPolygons: (pathData, points)->
    q = storedProcedure(sql)
    res = await db.query q, {
      geometry: {
        coordinates: pathData,
        type: 'MultiLineString'
      }
      points
    }
    @setState {polygons: res}

  render: ->
    {polygons} = @state
    h 'div', [
      h SVG, {className: 'cross-section'}, [
        h PolygonComponent, {polygons}
        h 'g.linework'
        h 'g.overlay'
      ]
    ]




export {CrossSectionUnits}
