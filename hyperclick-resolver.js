"use babel"
// Path resolver for Atom hyperclick
const path = require("path")

module.exports = customResolver({ basedir, moduleName }) {
  // You can use whatever strategy you want to convert your modules
  const [prefix, ...rest] = moduleName.split("/")

  // Resolve tilde paths
  if (prefix === "~") {
    return path.join(__dirname, 'app', rest.join("/"))
  }

  return moduleName
}
