/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import {join, dirname, resolve, basename} from "path";
import Promise from "bluebird";
import {readFileSync} from 'fs';
const {getUID, getHash} = require("./util");

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
const pgLib = require('pg-promise');
const pgp = pgLib(opts);
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

var queryLibrary = [];
// Serialize queries based on query file and opts
class SerializableQuery {
  constructor(fileName, values=null, opts={}){
    this.fileName = fileName;
    this.values = values;
    const query = storedProcedure(this.fileName);
    this.id = basename(this.fileName, '.sql');
    this.sql = pgp.as.format(query, this.values);
    this.uid = getUID(this.id, this.values);
    this.hash = getHash(this.id, this.values);
    if (this.values != null) {
      this.outputFile = `${this.id}-${this.hash}.json`;
    } else {
      this.outputFile = `${this.id}.json`;
    }
    queryLibrary.push(this);
  }
  getData() { return db.query(this.sql); }
}

import q1 from "../lateral-variation/sql/boundary-heights.sql";
new SerializableQuery(q1);
import q2 from "../lateral-variation/sql/section-units.sql";
new SerializableQuery(q2);
import q3 from "../lateral-variation/sql/sections.sql";
new SerializableQuery(q3);
import q4 from "../lateral-variation/sql/unit-heights.sql";
new SerializableQuery(q4);

import lithostratNames from "../sections/summary-sections/sql/lithostratigraphy-names.sql";
new SerializableQuery(lithostratNames);
import lithostratSurface from "../sections/summary-sections/sql/lithostratigraphy-surface.sql";
new SerializableQuery(lithostratSurface);

import unitData from "../map-viewer/legend/sql/unit-data.sql";
new SerializableQuery(unitData);

import faciesQuery from "../sections/facies/sql/facies.sql";
new SerializableQuery(faciesQuery);

import sectionsQuery from "../sections/sql/sections.sql";
new SerializableQuery(sectionsQuery);
import sectionSurface from "../sections/sql/section-surface.sql";
new SerializableQuery(sectionSurface);
import allCarbonIsotopes from "../sections/sql/all-carbon-isotopes.sql";
new SerializableQuery(allCarbonIsotopes);

import carbonIsotopes from "../sections/sql/carbon-isotopes.sql";
new SerializableQuery(carbonIsotopes);

import photoQuery from '../sections/sql/photo.sql';
new SerializableQuery(photoQuery);

// Section lithology
import lithQuery from '../sections/lithology/lithology.sql';
new SerializableQuery(lithQuery);
import ftQuery from '../sections/facies/sql/facies-tracts.sql';
new SerializableQuery(ftQuery);

// Generalized sections
import generalizedSections from '../sections/sql/generalized-section.sql';
new SerializableQuery(generalizedSections);

import symbols from '../sections/sql/symbols.sql';
new SerializableQuery(symbols);



import sq1 from '../sections/sql/flooding-surface.sql';
//import sq2 from '../sections/sql/section-samples.sql'
import sq4 from '../sections/sql/section-lithology.sql';
import sq5 from '../sections/sql/log-notes.sql';

const allSectionQueries =  [sq1,sq4,sq5];

let alreadyLoaded = false;
const createSerializedQueries = function(sectionLabels){
  for (let sql of Array.from(allSectionQueries)) {
    for (let l of Array.from(sectionLabels)) {
      new SerializableQuery(sql,[l]);
    }
  }
  return alreadyLoaded = true;
};

const serializableQueries = async function() {
  //# Return a list of serializable queries for writing
  // out to files
  const sections = await db.query(storedProcedure(sectionsQuery));
  if (alreadyLoaded) { return; }
  const sectionLabels = sections.map(d => d.section);
  createSerializedQueries(sectionLabels);
  return queryLibrary;
};

export {
  db, storedProcedure, serializableQueries, helpers
};
