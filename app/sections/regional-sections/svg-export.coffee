import path from 'path'
import {writeFileSync} from 'fs'

exportSVG = (node, outputFile)->
  # Should make this work only in Node
  serializer = new XMLSerializer()
  return unless node?
  svgString = serializer.serializeToString(node)
  writeFileSync(outputFile, svgString, 'utf-8')

filenameForID = (id, ext)->
  return path.join(
    path.resolve("."),
    "sections",
    "regional-sections",
    "sequence-data",
    require.resolve("./#{id}.#{ext}")
  )

exportSequence = (id, node)-> ->
  return unless node?
  overlay = node.querySelector(".sequence-link-overlay")
  return unless overlay?
  {x: rootX, y: rootY} = overlay.getBoundingClientRect()

  sections = node.querySelectorAll(".section")
  return unless sections.length > 0

  g = document.createElementNS("http://www.w3.org/2000/svg", 'g')
  g.setAttribute("class", "sections")

  for section in sections
    s1 = section.querySelector("g.lithology-column")
    {x,y} = section.getBoundingClientRect()
    s1a = s1.cloneNode(true)
    t = "translate(#{x-rootX+5}, #{y-rootY+5})"
    s1a.setAttribute('transform', t)
    # Adobe Illustrator does not support SVG clipping paths.
    clip = s1a.querySelector("defs")
    clip.parentNode.removeChild(clip)

    s1a.querySelector('.inner').removeAttribute('clip-path')

    r = s1a.querySelector("use")
    r.parentNode.removeChild(r)
    g.appendChild(s1a)

  root = overlay.cloneNode(true)
  root.appendChild(g)

  exportSVG(root, filenameForID(id,"svg"))

export {filenameForID, exportSequence}
