/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import {join} from "path";
import {createHash} from "crypto";

// Queries have to have unique identifiers and combinations of parameters

const getUID = (id, values) => JSON.stringify([id,values]);

const getHash = function(id,values){
  const uid = getUID(id,values);
  //console.log "Hashing: #{uid}"
  const md5sum = createHash('md5');
  return md5sum.update(uid).digest('hex').slice(0,8);
};

export { getUID, getHash };
