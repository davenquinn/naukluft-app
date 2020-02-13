/*
 * decaffeinate suggestions:
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let db, QUERY_DIRECTORY, storedProcedure;
import {join, resolve, basename} from "path";
import Promise from "bluebird";
import {getUID, getHash} from "./util";
import {getJSON} from "../util";
import {useState} from 'react';
import useAsyncEffect from 'use-async-effect';

if (global.PLATFORM === global.ELECTRON) {
  let serializableQueries;
  const {PROJECT_DIR} = process.env;
  if ((PROJECT_DIR == null)) {
    throw "Environment variable PROJECT_DIR must be defined.";
  }
  ({db, storedProcedure, serializableQueries} = require('./backend'));
  QUERY_DIRECTORY = join(PROJECT_DIR,"versioned","Products","webroot","queries");
} else {
  QUERY_DIRECTORY = join(BASE_URL,"queries");
}

const __queryList = null;
const query = async function(id, values, opts={}){
  /*
  Generalized query that picks the best method for
  getting query variables
  */
  let res;
  const {baseDir} = opts;
  if ((id == null)) {
    res = [];
  }
  if (global.PLATFORM === global.ELECTRON) {
    // Get data directly from database (only works on backend)
    res = await db.query(storedProcedure(id, {baseDir}), values);
  } else {
    // Get JSON from our library of stored queries
    let fn;
    const v = basename(id,'.sql');
    console.log(v,values);
    if (values != null) {
      fn = `${v}-${getHash(v,values)}.json`;
    } else {
      fn = `${v}.json`;
    }

    res = await getJSON(join(QUERY_DIRECTORY,fn));
  }
  return res;
};

const useQuery = function(sql, args=[]){
  /*
  A react hook to use the result of a query
  */
  const [result, updateResult] = useState(null);
  const runQuery = async function() {
    const res = await query(sql, args);
    return updateResult(res);
  };
  useAsyncEffect(runQuery, args);
  return result;
};

export {
  query,
  useQuery,
  storedProcedure,
  db
};
