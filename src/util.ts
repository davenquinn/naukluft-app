import axios from "axios";
import { Platform, currentPlatform } from "naukluft-data-backend";

const getJSON = async function(url) {
  let data;
  if (currentPlatform == Platform.WEB) {
    // We are using a web-like backend
    console.log(`Requesting json at ${url}`);
    try {
      const { status, data } = await axios.get(url);
      return data;
    } catch (err) {
      console.error(err);
      return null;
    }
  } else {
    // Assume we can do a direct require
    const { readFileSync } = require("fs");
    data = JSON.parse(readFileSync(url));
    return Promise.resolve(data);
  }
};

export { getJSON };
