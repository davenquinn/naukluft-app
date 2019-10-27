import {join, dirname, resolve, basename} from "path"
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
storedProcedure = (fileName)->
  # Don't hit the filesystem repeatedly
  # in a session
  queryFiles[fileName] ?= pgp.QueryFile(fileName)
  console.log queryFiles[fileName]
  return queryFiles[fileName]

queryLibrary = []
# Serialize queries based on query file and opts
class SerializableQuery
  constructor: (@fileName, @values=null, opts={})->
    fn = resolve(__dirname, @fileName)
    query = storedProcedure(fn, opts)
    @id = basename(@fileName, '.sql')
    @sql = pgp.as.format(query, @values)
    @uid = getUID @fileName, @values
    @hash = getHash @fileName, @values
    queryLibrary.push(@)
  getData: -> db.query @sql
  filename: -> @id+'_'+@hash+'.json'

import lateralVariationQueries from "../lateral-variation/sql/*.sql"
for q in lateralVariationQueries
  new SerializableQuery(q, null, {baseDir})

import lithostratQueries from "../sections/summary-sections/sql/*.sql"
for fn in lithostratQueries
  new SerializableQuery(fn)

import unitData from "../map-viewer/legend/sql/unit-data.sql"
new SerializableQuery(unitData)

import faciesQuery from "../sections/facies/sql/facies.sql"
new SerializableQuery(faciesQuery)

import sectionQueries from "../sections/sql/*.sql"
new SerializableQuery(sectionQueries['sections'])
new SerializableQuery(sectionQueries['section-surface'])
new SerializableQuery(sectionQueries['carbon-isotopes'])

sectionLabels = null

sectionQueryLabels =  [
  'flooding-surface'
  'section-samples'
  'section-symbols'
  'lithology'
  'log-notes'
  'photo'
]

alreadyLoaded = false
createSerializedQueries = (sectionLabels)->
  for q in sectionQueryLabels
    for l in sectionLabels
      new SerializableQuery(sectionQueries[q],[l])
  alreadyLoaded = true

serializableQueries = ->
  ## Return a list of serializable queries for writing
  # out to files
  sections = await db.query storedProcedure(sectionQueries['sections'])
  return if alreadyLoaded
  sectionLabels = sections.map (d)->d.section
  createSerializedQueries()

  createSerializedQueries()
  return queryLibrary


export {
  db, storedProcedure, serializableQueries, helpers
}
