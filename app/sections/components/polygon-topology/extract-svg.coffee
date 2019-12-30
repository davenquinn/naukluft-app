import {select} from 'd3-selection'

removeLines = (f, niter=1)->
  # Strip the first N lines of text
  for i in [0...niter]
    f = f.substring(f.indexOf("\n") + 1)
  return f

distanceFromLine = (p1,p2,p3)->
  # distance of p3 from the line defined
  # between p1 and p2
  [x1,y1] = p1
  [x2,y2] = p2
  [x3,y3] = p3
  dx = x2-x1
  dy = y2-y1
  top = Math.abs(dy*x3-dx*y3+x2*y1-y2*x1)
  btm = Math.sqrt(Math.pow(dx,2)+Math.pow(dy,2))
  return top/btm

coordAtLength = (path, pos)->
  {x,y} = path.getPointAtLength(pos)
  x = Math.round(x*10)/10
  y = Math.round(y*10)/10
  [x,y]

extractLine = (opts={})->(node)->
  opts.simplifyThreshold ?= 0.02
  opts.simplify ?= true
  if node.nodeName == 'line'
    # Lines don't have getTotalLength or points methods
    v = (id)-> node.getAttribute(id) or 0
    return [
      [v('x1'), v('y1')],
      [v('x2'), v('y2')]
    ]
  if node.points?
    # We can extract directly
    return Array.from node.points, ({x,y})->[x,y]
  # We must interpolate from path data

  len = node.getTotalLength()
  return if len == 0
  pos = 0
  coordinates = []
  while pos < len
    coordinates.push coordAtLength(node,pos)

    if coordinates.length >= 3 and opts.simplify?
      c1 = coordinates.slice(coordinates.length-3,3)
      if c1.length == 3
        dist = distanceFromLine(c1[0],c1[2],c1[1])
        if dist < opts.simplifyThreshold
          coordinates.splice(coordinates.length-2,1)
    # pop second to last
    pos += 0.2
  coordinates.push coordAtLength(node,len)
  return coordinates

extractTextPosition = (node)->
  txt = select(node).text()
  {x,y,width,height} = node.getBBox()
  {e,f} = node.transform.baseVal[0].matrix
  loc = [e+x+width/2,f+y+height/2]
  geometry = {coordinates: loc, type: "Point"}
  return {type: 'Feature', id: txt, geometry}

extractLines = (sel)->
  ### Get path data ###
  pathNodes = sel.selectAll 'path,line,polygon,polyline'
  return Array.from pathNodes.nodes(), extractLine()

extractTextPositions = (sel)->
  textNodes = sel.selectAll('text')
  return Array.from(textNodes.nodes(), extractTextPosition)

export {extractLines, extractTextPositions, removeLines}
