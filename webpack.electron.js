const path = require("path");
const {sharedLoaders, resolve} = require('./loaders');

module.exports = {
  module: {
    rules: [
      ...sharedLoaders(false)
    ]
  },
  resolve
}
