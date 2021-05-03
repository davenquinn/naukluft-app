import { resolve, join } from "path";
const PGPromise = require("pg-promise");
import Promise from "bluebird";
const { readFileSync } = require("fs");

const opts = {
  promiseLib: Promise,
  noWarnings: true,
};

// Create database connection
const pgp = PGPromise(opts);
const db = pgp("postgresql:///Naukluft");
const { helpers } = pgp;

const queryFiles = {};

const storedProcedure = function (fileName) {
  // Don't hit the filesystem repeatedly
  // in a session
  const fn = resolve(fileName);
  if (queryFiles[fn] == null) {
    queryFiles[fn] = readFileSync(fn, "UTF-8");
  }
  return queryFiles[fn];
};

export { db, storedProcedure, helpers, pgp };
