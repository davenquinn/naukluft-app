
# https://pomax.github.io/bezierjs/
# http://jsfiddle.net/halfsoft/Gsz2a/

import {Component, useContext, useState, useEffect} from 'react'
import {findDOMNode} from 'react-dom'
import h from '@macrostrat/hyper'
import {SVG} from '@macrostrat/column-components'
import {SectionNavigationControl} from '../util'
import {path} from 'd3-path'
import {schemeSet3} from 'd3-scale-chromatic'
import {geoPath, geoTransform} from 'd3-geo'
import {select} from 'd3-selection'
import {readFileSync} from 'fs'
import {join} from 'path'
import {db, storedProcedure} from '../db'
import './main.styl'
import {PlatformContext} from '../../platform'
import {
  PolygonTopology,
  extractTextPositions,
  extractLines
  removeLines
} from '../components/polygon-topology'
import {useAsyncEffect} from 'use-async-effect'

coordAtLength = (path, pos)->
  {x,y} = path.getPointAtLength(pos)
  x = Math.round(x*10)/10
  y = Math.round(y*10)/10
  [x,y]

facies_ix = {
  shale: [620, '#DCEDC8']
  gs: [627, '#4A148C']
  ms: [642, '#BBDEFB']
  cc: [601,'#006064']
  fc: [669,'#4DB6AC']
}

PatternDefs = ({patterns, size})->
  {resolveLithologySymbol} = useContext(PlatformContext)
  size ?= 30
  patternSize = {width: size, height: size}
  patternLoc = {x:0,y:0}

  h 'defs', patterns.map (d)->
    id = "pattern-#{d[0]}"
    h 'pattern', {
      id
      key: id
      patternUnits: "userSpaceOnUse"
      patternSize...
    }, [
      h 'rect', {
        fill: d[1]
        patternSize...
        patternLoc...
      }
      h 'image', {
        xlinkHref: resolveLithologySymbol(d[0], {svg: true})
        patternLoc...
        patternSize...
      }
    ]

class RegionalCrossSectionPage extends Component
  constructor: ->
    super arguments...
    @state = {lines: null, points: null}

  componentDidMount: ->
    fn = join __dirname, "stratigraphic-model.svg"
    svg = readFileSync fn
    fst = svg.toString()
    v = removeLines(fst, 2)
    el = select findDOMNode @

    tcs = el.select("div.temp-cross-section")
    tcs.html v
    svg = tcs.select "svg"

    main = svg.select("g#Main")

    ### Get path data ###

    lines = extractLines(main)

    cs = el.select("svg.cross-section")
      .attr "viewBox", svg.attr("viewBox")
    cs.select("g.linework")
      .node().appendChild main.node()

    pts = svg.select("g#Labels")
    cs.select("g.overlay")
      .node().appendChild(pts.node())

    ### Get facies data ###
    points = extractTextPositions(svg.select("g#Facies"))

    svg.remove()

    @setState {lines, points}

  render: ->
    {lines, points} = @state
    h 'div', [
      h SectionNavigationControl
      h SVG, {className: 'cross-section'}, [
        h PolygonTopology, {
          lines,
          points,
          generateFill: (p, i)->
            {facies_id, geometry} = p
            return null unless geometry
            if facies_id?
              return "url(#pattern-#{facies_ix[facies_id][0]})"
            return schemeSet3[i%12]
        }, [
          h PatternDefs, {patterns: Object.values(facies_ix), size: 30}
        ]
        h 'g.linework'
        h 'g.overlay'
      ]
      h 'div.temp-cross-section'
    ]

export {RegionalCrossSectionPage}
