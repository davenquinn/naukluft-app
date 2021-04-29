/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import {resolve, join} from "path";
import PGPromise from 'pg-promise';
import Promise from "bluebird";
import {readFileSync} from 'fs';

const opts = {
  promiseLib: Promise,
  noWarnings: true
};

// Create database connection
const pgp = PGPromise(opts);
const db = pgp('postgresql:///Naukluft');
const {helpers} = pgp;

const queryFiles = {};

const storedProcedure = function(fileName){
  // Don't hit the filesystem repeatedly
  // in a session
  const fn = resolve(fileName);
  if ((queryFiles[fn] == null)) {
    queryFiles[fn] = readFileSync(fn, 'UTF-8');
  }
  return queryFiles[fn];
};

export {
  db, storedProcedure, helpers
};
