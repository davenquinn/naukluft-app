import h from 'react-hyperscript'
import {readFileSync} from 'fs'
import {join} from 'path'
import {select} from 'd3-selection'
import {Component} from 'react'
import {findDOMNode} from 'react-dom'
import {SVG} from "#"
import {geoPath, geoTransform} from 'd3-geo'
import {db, storedProcedure} from '../db'
import sql from '../regional-cross-section/filled-topology/get-generalized.sql'

import {PolygonComponent} from '../regional-cross-section'
import {filenameForID} from './svg-export'
import {removeLines, useFaciesColors} from './util'

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

distanceFromLine = (p1,p2,p3)->
  # distance of p3 from the line defined
  # between p1 and p2
  [x1,y1] = p1
  [x2,y2] = p2
  [x3,y3] = p3
  dx = x2-x1
  dy = y2-y1
  top = Math.abs(dy*x3-dx*y3+x2*y1-y2*x1)
  btm = Math.sqrt(Math.pow(dx,2)+Math.pow(dy,2))
  return top/btm


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
        console.log @
        if @points?
          coords = Array.from @points, ({x,y})->[x,y]
          pathData.push coords
          return

        threshold = 0.05
        len = @getTotalLength()
        return if len == 0
        pos = 0
        coordinates = []
        while pos < len
          coordinates.push coordAtLength(@,pos)

          if coordinates.length >= 3
            c1 = coordinates.slice(coordinates.length-3,3)
            if c1.length == 3
              dist = distanceFromLine.apply(null, c1)
              if dist < threshold
                coordinates.splice(coordinates.length-2,1)
          # pop second to last
          pos += 0.2
        coordinates.push coordAtLength(@,len)
        pathData.push coordinates

    el = select findDOMNode @
    console.log el, main.node()

    for v in ['viewBox', 'width', 'height']
      el.attr v, svg.attr(v)

    el.select("g.linework")
      .node().appendChild main.node()

    pts = svg.select("g#Labels").node()
    if pts?
      el.select("g.overlay")
        .node().appendChild(pts)

    ### Get facies data ###
    points = []
    facies = svg.select("g#Facies")
    facies.selectAll 'text'
      .each ->
        faciesID = select(@).text()
        {x,y,width,height} = @getBBox()
        {e,f} = @transform.baseVal[0].matrix
        loc = [e+x+width/2,f+y+height/2]
        geometry = {coordinates: loc, type: "Point"}
        points.push {type: 'Feature', id: faciesID, geometry}

    svg.remove()

    @getPolygons(pathData, points)

  getPolygons: (pathData, points)->
    geometry = {
      coordinates: pathData,
      type: 'MultiLineString'
    }

    q = storedProcedure(sql)

    console.log JSON.stringify {geometry, points}
    res = await db.query q, {
      geometry
      points
    }
    console.log res
    @setState {polygons: res}

  render: ->
    {id, rest...} = @props
    {polygons} = @state
    h SVG, {className: 'cross-section', rest...}, [
      h PolygonComponent, {polygons}
      h 'g.linework'
      h 'g.overlay'
    ]

export {CrossSectionUnits}
