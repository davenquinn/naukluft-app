import {join, resolve, basename} from "path"
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
    res = []
  if global.PLATFORM == global.ELECTRON
    # Get data directly from database (only works on backend)
    res = await db.query storedProcedure(id, {baseDir}), values
  else
    # Get JSON from our library of stored queries
    v = basename(id,'.sql')
    console.log(v,values)
    if values?
      fn = "#{v}-#{getHash(v,values)}.json"
    else
      fn = "#{v}.json"

    res = await getJSON join(QUERY_DIRECTORY,fn)
  return res

useQuery = (sql, args=[])->
  ###
  A react hook to use the result of a query
  ###
  [result, updateResult] = useState(null)
  runQuery = ->
    res = await query(sql, args)
    updateResult(res)
  useAsyncEffect runQuery, args
  return result

export {
  query
  useQuery
  storedProcedure
  db
}
