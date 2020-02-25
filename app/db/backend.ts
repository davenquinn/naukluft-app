/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import {resolve} from "path";
import PGPromise from 'pg-promise';
import Promise from "bluebird";
import {readFileSync} from 'fs';

const opts = {
  promiseLib: Promise,
  noWarnings: true,
  query: e=> {
    const v = queryLibrary.find(d => d.sql === e.query);
    //console.log e.query
    if ((v == null) && process.env.WARN_NO_SERIALIZATION_SPEC) {
      return console.warn(`No serialization spec found matching the query \`${e.query}\`. \
This request will fail on the frontend.`
      );
    }
  }
};

// Create database connection
const pgp = PGPromise(opts);
const db = pgp('postgresql:///Naukluft');
const {helpers} = pgp;

const queryFiles = {};

const storedProcedure = function(fileName){
  // Don't hit the filesystem repeatedly
  // in a session
  const fn = resolve(__dirname,fileName);
  if ((queryFiles[fn] == null)) {
    queryFiles[fn] = readFileSync(fn, 'UTF-8');
  }
  return queryFiles[fn];
};

export {
  db, storedProcedure, helpers
};
