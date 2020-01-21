import {join, dirname, resolve, basename} from "path"
import Promise from "bluebird"
import {readFileSync} from 'fs'
{getUID, getHash} = require("./util")

opts = {
  promiseLib: Promise
  noWarnings: true
  query: (e)=>
    v = queryLibrary.find (d)->
      d.sql == e.query
    #console.log e.query
    if not v? and process.env.WARN_NO_SERIALIZATION_SPEC
      console.warn "No serialization spec found matching the query `#{e.query}`.
                    This request will fail on the frontend."
}

# Create database connection
pgLib = require('pg-promise')
pgp = pgLib(opts)
db = pgp('postgresql:///Naukluft')
{helpers} = pgp

queryFiles = {}

storedProcedure = (fileName)->
  # Don't hit the filesystem repeatedly
  # in a session
  fn = resolve(__dirname,fileName)
  if not queryFiles[fn]?
    queryFiles[fn] = readFileSync(fn, 'UTF-8')
  return queryFiles[fn]

queryLibrary = []
# Serialize queries based on query file and opts
class SerializableQuery
  constructor: (@fileName, @values=null, opts={})->
    query = storedProcedure(@fileName)
    @id = basename(@fileName, '.sql')
    @sql = pgp.as.format(query, @values)
    @uid = getUID @id, @values
    @hash = getHash @id, @values
    if @values?
      @outputFile = "#{@id}-#{@hash}.json"
    else
      @outputFile = "#{@id}.json"
    queryLibrary.push(@)
  getData: -> db.query @sql

import q1 from "../lateral-variation/sql/boundary-heights.sql"
new SerializableQuery(q1)
import q2 from "../lateral-variation/sql/section-units.sql"
new SerializableQuery(q2)
import q3 from "../lateral-variation/sql/sections.sql"
new SerializableQuery(q3)
import q4 from "../lateral-variation/sql/unit-heights.sql"
new SerializableQuery(q4)

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
import allCarbonIsotopes from "../sections/sql/all-carbon-isotopes.sql"
new SerializableQuery(allCarbonIsotopes)

import carbonIsotopes from "../sections/sql/carbon-isotopes.sql"
new SerializableQuery(carbonIsotopes)

import photoQuery from '../sections/sql/photo.sql'
new SerializableQuery(photoQuery)

# Section lithology
import lithQuery from '../sections/lithology/lithology.sql'
new SerializableQuery(lithQuery)
import ftQuery from '../sections/facies/sql/facies-tracts.sql'
new SerializableQuery(ftQuery)

# Generalized sections
import generalizedSections from '../sections/sql/generalized-section.sql'
new SerializableQuery(generalizedSections)

import symbols from '../sections/sql/symbols.sql'
new SerializableQuery(symbols)



import sq1 from '../sections/sql/flooding-surface.sql'
#import sq2 from '../sections/sql/section-samples.sql'
import sq4 from '../sections/sql/section-lithology.sql'
import sq5 from '../sections/sql/log-notes.sql'

allSectionQueries =  [sq1,sq4,sq5]

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
  createSerializedQueries(sectionLabels)
  return queryLibrary

export {
  db, storedProcedure, serializableQueries, helpers
}
