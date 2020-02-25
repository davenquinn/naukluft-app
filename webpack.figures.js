let cfg = require('./webpack.base.js')
const {resolve} = require("path")

cfg.entry = {
  'regional-sections': "./app/sections/regional-sections/__static-figure/index.ts",
}

cfg.output = {
  path: resolve("./dist-figures"),
  filename: "[name].js",
  sourceMapFilename: '[file].map'
}

cfg.context = resolve(__dirname,'app')

module.exports = cfg;
