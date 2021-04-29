/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import {safeLoad} from "js-yaml";
import Promise from "bluebird";
import {get} from 'axios';

const getJSON = async function(url){
  let data;
  if ((typeof window !== 'undefined' && window !== null) && (PLATFORM !== ELECTRON)) {
    // We are using a web-like backend
    let status;
    console.log(`Requesting json at ${url}`);
    ({status, data} = await get(url));
    if ((data == null)) {
      throw `Request failed with status code ${status}`;
    }
    console.log(data);
    return data;
  } else {
    // Assume we can do a direct require
    const {readFileSync} = require('fs');
    data = JSON.parse(readFileSync(url));
    return Promise.resolve(data);
  }
};

const getYAML = function(url){
  if ((typeof window !== 'undefined' && window !== null) && (PLATFORM !== ELECTRON)) {
    return new Promise(function(resolve, reject){
      const req = require('browser-request');
      return req({uri: url}, function(err, response){
        if (err != null) {
          reject(err);
          return;
        }
        const text = response.body;
        const data = safeLoad(text);
        return resolve(data);
      });
    });
  } else {
    // Assume we can do a direct require
    const {readFileSync} = require('fs');
    const data = safeLoad(readFileSync(url));
    return Promise.resolve(data);
  }
};

export {getJSON, getYAML};
