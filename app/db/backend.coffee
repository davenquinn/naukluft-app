{join, dirname} = require 'path'
Promise = require 'bluebird'
{getUID, getHash} = require './util'

opts = {
  promiseLib: Promise
  query: (e)=>
    console.log e.query
    v = queryLibrary.find (d)->
      d.sql == e.query
    if not v?
      console.warn "No serialization spec found matching this query.
                    This request will fail on the frontend."
}

pgp = require('pg-promise')(opts)
db = pgp('postgresql:///Naukluft')

storedProcedure = (id, opts={})->
  {baseDir} = opts
  baseDir ?= __dirname
  if not id.endsWith('.sql')
    id = join(baseDir,'sql',"#{id}.sql")
  pgp.QueryFile(id)

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
  filename: -> query.hash+'.json'

baseDir = dirname require.resolve "../lateral-variation"
lateralVariationQueries = [
  'unit-heights'
  'sections'
  'boundary-heights'
]
for q in lateralVariationQueries
  new SerializableQuery(q, null, {baseDir})

baseDir = dirname require.resolve "../sections"
new SerializableQuery('sections', null, {baseDir})
new SerializableQuery('carbon-isotopes', null, {baseDir})

sectionLabels = null
sectionQueries =  [
  'flooding-surface'
  'section-samples'
  'lithology'
  'log-notes'
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


module.exports = {
  db, storedProcedure, serializableQueries
}