import { resolve, join } from "path";
const PGPromise = require("pg-promise");
const { readFileSync } = require("fs");
import { queryResult } from "pg-promise";

const opts = {
  noWarnings: true
};

const pg_conn = process.env.NAUKLUFT_DB ?? "postgresql:///Naukluft";

// Create database connection
const pgp = PGPromise(opts);
const db = pgp(pg_conn, { log: true });
const { helpers } = pgp;

const queryFiles: { [k: string]: string } = {};

const storedProcedure = function(fileName: string) {
  // Don't hit the filesystem repeatedly
  // in a session
  const fn = resolve(fileName);
  if (queryFiles[fn] == null) {
    queryFiles[fn] = readFileSync(fn, "UTF-8");
  }
  return queryFiles[fn];
};

async function runBackendQuery(
  key: string,
  params: any = null,
  resultMask: queryResult = queryResult.any
) {
  let fn = key;
  if (!key.endsWith(".sql")) {
    fn = resolve(join(__dirname, "..", "sql", key + ".sql"));
  }
  try {
    return await db.query(storedProcedure(fn), params, resultMask);
  } catch (err) {
    throw new Error(`Query ${fn} failed to run`);
  }
}

export { queryResult as ResultMask };
export { db, storedProcedure, helpers, pgp, runBackendQuery };
