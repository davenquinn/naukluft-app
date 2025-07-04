/*
 * decaffeinate suggestions:
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let QUERY_DIRECTORY;
import { join, basename } from "path";
import { getUID, getHash } from "./util";
import { getJSON } from "../util";
import { useState } from "react";
import useAsyncEffect from "use-async-effect";

console.log(global.PLATFORM);

if (global.PLATFORM === global.ELECTRON) {
  const { PROJECT_DIR } = process.env;
  if (PROJECT_DIR == null) {
    throw "Environment variable PROJECT_DIR must be defined.";
  }
  QUERY_DIRECTORY = join(
    PROJECT_DIR,
    "versioned",
    "Products",
    "webroot",
    "queries",
  );
} else {
  QUERY_DIRECTORY = join(BASE_URL, "queries");
}

let db, storedProcedure;
if (global.PLATFORM === global.ELECTRON) {
  const bak = require("naukluft-data-backend/src/database");
  db = bak.db;
  storedProcedure = bak.storedProcedure;
} else {
  db = null;
  storedProcedure = null;
}

const __queryList = null;
const query = async function (id, values, opts = {}) {
  /*
  Generalized query that picks the best method for
  getting query variables
  */
  console.warn("The ~/db module is deprecated and should be replaced");
  let res;
  const { baseDir } = opts;
  if (id == null) {
    res = [];
  }
  if (global.PLATFORM === global.ELECTRON) {
    // Get data directly from database (only works on backend)
    res = await db.query(storedProcedure(id, { baseDir }), values);
  } else {
    // Get JSON from our library of stored queries
    let fn;
    const v = basename(id, ".sql");
    console.log(v, values);
    if (values != null) {
      fn = `${v}-${getHash(v, values)}.json`;
    } else {
      fn = `${v}.json`;
    }

    try {
      res = await getJSON(join(QUERY_DIRECTORY, fn));
    } catch (err) {
      res = [];
    }
  }
  return res;
};

const useUpdateableQuery = function (sql, args = []) {
  /** A react hook to use the result of a query */
  const [result, updateResult] = useState(null);
  const runQuery = async function () {
    const res = await query(sql, args);
    return updateResult(res);
  };
  useAsyncEffect(runQuery, args);
  return [result, runQuery];
};

const useQuery = function (sql, args = []) {
  return useUpdateableQuery(sql, args)[0];
};

export { query, useQuery, useUpdateableQuery, storedProcedure, db };
