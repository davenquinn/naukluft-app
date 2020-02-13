/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import {db, storedProcedure, query} from "../db";
const baseDir = __dirname;
const newQuery = (id, values) => query(id,values, {baseDir: __dirname});

export {
  db,
  storedProcedure,
  newQuery as query
};
