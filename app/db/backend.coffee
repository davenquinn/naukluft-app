import {join, dirname, resolve} from "path"
import Promise from "bluebird"
import {getUID, getHash} from "./util"

opts = {
  promiseLib: Promise
  query: (e)=>
    v = queryLibrary.find (d)->
      d.sql == e.query
    #console.log e.query
    if not v?
      console.warn "No serialization spec found matching the query `#{e.query}`.
                    This request will fail on the frontend."
}

pgp = require('pg-promise')(opts)
db = pgp('postgresql:///Naukluft')
{helpers} = pgp

queryFiles = {}
storedProcedure = (id, opts={})->
  {baseDir} = opts
  baseDir ?= __dirname
  if not id.endsWith('.sql')
    id = join(baseDir,'sql',"#{id}.sql")
  # Don't hit the filesystem repeatedly
  # in a session
  queryFiles[id] ?= pgp.QueryFile(id)
  return queryFiles[id]

queryLibrary = []

# Serialize queries based on query file and opts
class SerializableQuery
  constructor: (@id, @values, opts={})->
    query = storedProcedure(@id, opts)
    @sql = pgp.as.format(query, @values)
    @uid = getUID @id, @values
    @hash = getHash @id, @values
    queryLibrary.push(@)
  getData: -> db.query @sql
  filename: -> @id+'_'+@hash+'.json'

baseDir = resolve join __dirname, "../lateral-variation"
lateralVariationQueries = [
  'unit-heights'
  'sections'
  'boundary-heights'
]
for q in lateralVariationQueries
  new SerializableQuery(q, null, {baseDir})

baseDir = resolve join __dirname, "../sections/summary-sections"
summarySectionQueries = [
  'lithostratigraphy-surface'
  'lithostratigraphy-names'
]
for q in summarySectionQueries
  new SerializableQuery(q, null, {baseDir})

baseDir = resolve join __dirname, "../map-viewer/legend"
new SerializableQuery('unit-data', null, {baseDir})


baseDir = resolve join __dirname, "../sections/facies"
new SerializableQuery('facies',null, {baseDir})

baseDir = resolve join __dirname, "../sections"
new SerializableQuery('sections', null, {baseDir})
new SerializableQuery('section-surface', null, {baseDir})
new SerializableQuery('carbon-isotopes', null, {baseDir})

sectionLabels = null

sectionQueries =  [
  'flooding-surface'
  'section-samples'
  'section-symbols'
  'lithology'
  'log-notes'
  'photo'
]

createSerializedQueries = ->
  for q in sectionQueries
    for l in sectionLabels
      v = new SerializableQuery(q,[l], {baseDir})

serializableQueries = ->
  ## Return a list of serializable queries for writing
  # out to files
  sections = await db.query storedProcedure('sections', {baseDir})
  return if sectionLabels?
  sectionLabels = sections.map (d)->d.section
  createSerializedQueries()

  createSerializedQueries()
  return queryLibrary


export {
  db, storedProcedure, serializableQueries, helpers
}
