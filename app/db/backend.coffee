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
  queryFiles[fileName] ?= pgp.QueryFile(resolve(__dirname,fileName))
  console.log queryFiles[fileName]
  return queryFiles[fileName]

queryLibrary = []
# Serialize queries based on query file and opts
class SerializableQuery
  constructor: (@fileName, @values=null, opts={})->
    fn = resolve(__dirname, @fileName)
    console.log fn
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
  new SerializableQuery(q)

import lithostratNames from "../sections/summary-sections/sql/lithostratigraphy-names.sql"
new SerializableQuery(lithostratNames)
import lithostratSurface from "../sections/summary-sections/sql/lithostratigraphy-surface.sql"
new SerializableQuery(lithostratSurface)

import unitData from "../map-viewer/legend/sql/unit-data.sql"
new SerializableQuery(unitData)

import faciesQuery from "../sections/facies/sql/facies.sql"
new SerializableQuery(faciesQuery)

import sectionsQuery from "../sections/sql/sections.sql"
new SerializableQuery(sectionsQuery)
import sectionSurface from "../sections/sql/section-surface.sql"
new SerializableQuery(sectionSurface)
import carbonIsotopes from "../sections/sql/carbon-isotopes.sql"
new SerializableQuery(carbonIsotopes)

import sq1 from '../sections/sql/flooding-surface.sql'
import sq2 from '../sections/sql/section-samples.sql'
import sq3 from '../sections/sql/section-symbols.sql'
import sq4 from '../sections/sql/lithology.sql'
import sq5 from '../sections/sql/log-notes.sql'
import sq6 from '../sections/sql/photo.sql'

allSectionQueries =  [sq1,sq2,sq3,sq4,sq5,sq6]

alreadyLoaded = false
createSerializedQueries = (sectionLabels)->
  for sql in allSectionQueries
    for l in sectionLabels
      new SerializableQuery(sql,[l])
  alreadyLoaded = true

serializableQueries = ->
  ## Return a list of serializable queries for writing
  # out to files
  sections = await db.query storedProcedure(sectionsQuery)
  return if alreadyLoaded
  sectionLabels = sections.map (d)->d.section
  createSerializedQueries(sections)
  return queryLibrary


export {
  db, storedProcedure, serializableQueries, helpers
}
