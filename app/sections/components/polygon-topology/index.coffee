import h from '@macrostrat/hyper'
import {geoPath, geoTransform} from 'd3-geo'
import {db, storedProcedure} from '../../db'
import sql from './polygonize.sql'
import {useState} from 'react'
import {useAsyncEffect} from 'use-async-effect'

proj = geoTransform {
  point: (px, py)-> @stream.point(px, py)
}
pathGenerator = geoPath().projection proj

TopoPolygon = ({feature, fill})->
  {geometry} = feature
  return null unless geometry
  h 'path', {d: pathGenerator(geometry), fill}

TopoPolygons = ({polygons, generateFill})->
  h 'g.polygons', polygons.map (p, i)->
    fill = generateFill(p,i)
    h TopoPolygon, {feature: p, fill}

PolygonTopology = (props)->
  {lines, points, generateFill, children, rest...} = props

  [polygons, setPolygons] = useState(null)

  getPolygons = ->
    return unless lines? and points?
    q = storedProcedure(sql)
    res = await db.query q, {
      geometry: {
        coordinates: lines,
        type: 'MultiLineString'
      }
      points
    }
    setPolygons(res)

  useAsyncEffect getPolygons, [lines, points]

  return null unless polygons?
  h 'g.polygon-container', [
    h TopoPolygons, {polygons, generateFill}
    children
  ]

export {PolygonTopology}
export * from './extract-svg'
