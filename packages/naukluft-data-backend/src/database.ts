import { resolve, join } from "path";
const PGPromise = require("pg-promise");
const { readFileSync } = require("fs");
import { queryResult } from "pg-promise";
import dotenv from "dotenv";

dotenv.config();

let pg_conn = process.env.NAUKLUFT_DB;

pg_conn = pg_conn.replace("postgresql://", "postgres://");

// Create database connection
const pgp = PGPromise();
const db = pgp({
  connectionString: pg_conn,
  max: 10,
  error(err: any, e: any) {
    console.error(err);
  },
});

const { helpers } = pgp;

const queryFiles: { [k: string]: string } = {};

const storedProcedure = function (fileName: string) {
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
  resultMask: queryResult = queryResult.any,
) {
  let fn = key;
  if (!key.endsWith(".sql")) {
    fn = resolve(join(__dirname, "..", "sql", key + ".sql"));
  }
  try {
    return await db.query(storedProcedure(fn), params, resultMask);
  } catch (err) {
    console.error(err);
    throw new Error(`Query ${fn} failed to run`);
  }
}

export { queryResult as ResultMask };
export { db, storedProcedure, helpers, pgp, runBackendQuery };
