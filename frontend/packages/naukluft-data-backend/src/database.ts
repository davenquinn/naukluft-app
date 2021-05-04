import { resolve, join } from "path";
const PGPromise = require("pg-promise");
const { readFileSync } = require("fs");

const opts = {
  noWarnings: true,
};

// Create database connection
const pgp = PGPromise(opts);
const db = pgp("postgresql:///Naukluft");
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

export { db, storedProcedure, helpers, pgp };
