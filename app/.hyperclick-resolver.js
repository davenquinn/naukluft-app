"use babel"
// Path resolver for Atom hyperclick
import path from "path"

export default function customResolver({ basedir, moduleName }) {
  // You can use whatever strategy you want to convert your modules
  const [prefix, ...rest] = moduleName.split("/")

  // Resolve tilde paths
  if (prefix === "~") {
    return path.join(__dirname, rest.join("/"))
  }

  return moduleName
}
