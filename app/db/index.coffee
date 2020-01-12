import {join, resolve} from "path"
import Promise from "bluebird"
import {getUID, getHash} from "./util"
import {getJSON} from "../util"
import {useState} from 'react'
import useAsyncEffect from 'use-async-effect'

if global.PLATFORM == global.ELECTRON
  {PROJECT_DIR} = process.env
  if not PROJECT_DIR?
    throw "Environment variable PROJECT_DIR must be defined."
  {db, storedProcedure, serializableQueries} = require './backend'
  QUERY_DIRECTORY = join(PROJECT_DIR,"versioned","Products","webroot","queries")

  ## Dump query spec to file
  # On every app load, get list of queries and write out to file
  do ->
    library = await serializableQueries()
    vals = library.map (d)->
      v1 = Object.fromEntries(Object.entries(d))
      delete v1.sql
      return v1

    # Make directories
    mkdirp = require('mkdirp')
    {writeFileSync} = require('fs')
    dn = resolve(join(__dirname, '..', '..', 'build'))
    mkdirp.sync(dn)
    res = JSON.stringify(vals, null, 4)
    return writeFileSync(join(dn,'query-spec.json'), res)
else
  QUERY_DIRECTORY = join(BASE_URL,"queries")

__queryList = null
query = (id, values, opts={})->
  ###
  Generalized query that picks the best method for
  getting query variables
  ###
  {baseDir} = opts
  if not id?
    return Promise.resolve([])
  if not SERIALIZED_QUERIES
    # Get data directly from database (only works on backend)
    func = -> db.query storedProcedure(id, {baseDir}), values
    if not __queryList?
      ## Get a list of potentially serializable queries
      # before returning queries
      p = serializableQueries()
        .then (d)-> __queryList = d
    else
      p = null
    return Promise.resolve(p)
      .then ->
        db.query storedProcedure(id, {baseDir}), values

  # We get JSON from our library of stored queries
  fn = "#{id}-#{getHash(id,values)}.json"
  clogs = "Getting query file `#{fn}` for query `#{id}`"
  if values?
    clogs += " with values #{values}"
  console.log(clogs)
  data = getJSON join(QUERY_DIRECTORY,fn)
  return data

useQuery = (sql, args=[])->
  ###
  A react hook to use the result of a query
  ###
  [result, updateResult] = useState([])
  q = storedProcedure(sql)
  runQuery = ->
    res = await db.query(q, args)
    updateResult(res)
  useAsyncEffect runQuery, args
  return result

export {
  query
  useQuery
  storedProcedure
  db
}
