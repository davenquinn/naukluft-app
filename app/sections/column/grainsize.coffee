d3 = require 'd3'
require 'd3-selection-multi'

module.exports = (el, opts={})->

  opts.showLabels ?= true
  opts.range ?= [10,20]
  opts.dy ?= 0
  opts.height ?= 100
  opts.scale ?= d3.scaleIdentity()

  #i = @y.invert(-width)
  sizes = ['ms','s','vf','f','m','c','vc','p']
  mn = sizes.length-1
  fn = d3.scaleLinear()
    .domain [0,mn]
    .range opts.range

  g = d3.select el
    .classed 'grainsize', true
    .classed 'axis', true

  sel = g.selectAll "g.tick"
    .data sizes

  grainsizeScale = d3.scaleOrdinal()
    .domain sizes
    .range sizes.map (d,i)->fn(i)

  esel = sel.enter()
    .append 'g'
    .attrs
      class: 'tick'
      transform: (d)->"translate(#{grainsizeScale(d)} 0)"

  if opts.showLabels
    esel.append 'text'
      .text (d)->d
      .attrs
        class: 'bottom'
        dy: 10+opts.dy
        y: opts.height

    esel.append 'text'
      .text (d)->d
      .attrs
        class: 'top'
        dy: -2-opts.dy
        y: 0

  yscale = opts.scale(0)-opts.scale(1)

  strokeScale = d3.scalePow()
    .exponent 2
    .domain [sizes.length, 0]
    .range [1,2]

  esel.append 'line'
    .attrs
      y1: 0
      x1: 0
      x2: 0
      y2: opts.height
    .style 'stroke-width', (d,i)->strokeScale i
    .style 'stroke-dasharray', (d,i)=>
      v = i
      a = (v*2)
      s = (yscale-a)/2
      "0 #{s} #{a} #{s}"

  return g
