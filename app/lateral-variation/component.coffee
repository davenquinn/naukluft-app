{findDOMNode} = require 'react-dom'
{Component} = require 'react'
d3 = require 'd3'
h = require 'react-hyperscript'
createVisualization = require '.'

{db, storedProcedure} = require 'stratigraphic-column/src/db'

class LateralVariation extends Component
  render: ->
    h 'div#lateral-variation'
  componentDidMount: ->
    node = findDOMNode @
    createVisualization(node)

module.exports = LateralVariation

