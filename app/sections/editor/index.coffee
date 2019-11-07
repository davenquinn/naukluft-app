import {findDOMNode} from "react-dom"
import {Component, useContext} from "react"
import {Dialog, Button, Intent, ButtonGroup, Alert, Slider, Switch} from "@blueprintjs/core"
import {DeleteButton} from '@macrostrat/ui-components'
import Select from 'react-select'
import {format} from "d3-format"

import {FaciesDescriptionSmall, FaciesCard} from "#/editor/facies"
import {FaciesContext, ColumnContext} from "#/context"
import {PickerControl} from "#/editor/picker-base"
import {LabeledControl, IntervalEditorTitle} from "#/editor/util"
#import "react-select/dist/react-select.css"

import {LithologyPicker, LithologySymbolPicker, FillPatternControl} from '#/editor/lithology-picker'
import {
  CorrelatedSurfaceControl,
  SurfaceOrderSlider,
  HorizontalPicker,
  BoundaryStyleControl
} from '#/editor/controls'
import {FaciesPicker} from '#/editor/facies/picker'
import {grainSizes} from "#/grainsize"
import {IntervalShape} from '#/editor/types'
import T from 'prop-types'
import {dirname} from "path"
import {hyperStyled} from "@macrostrat/hyper"
import styles from "./style.styl"
h = hyperStyled(styles)

import {db, storedProcedure, query} from "~/sections/db"

baseDir = dirname require.resolve '..'
sql = (id)-> storedProcedure(id, {baseDir})
try
  {helpers} = require '~/db/backend'
catch
  {}

floodingSurfaceOrders = [-1,-2,-3,-4,-5,null,5,4,3,2,1]

surfaceTypes = [
  {value: 'mfs', label: 'Maximum flooding surface'}
  {value: 'sb', label: 'Sequence boundary'}
]

LithologyControls = (props)->
  {interval, update} = props
  h [
    h LabeledControl, {
      title: "Lithology"
      is: LithologyPicker
      interval
      onChange: (lithology)=>update {lithology}
    }
    h LabeledControl, {
      title: 'Lithology symbol'
      is: LithologySymbolPicker
      interval
      onChange: (d)=>update {fillPattern: d}
    }
  ]

_fmt = format('.2f')
fmt = (d)->
  val = _fmt(d)
  for i in [0...1]
    lastIx = val.length-1
    return val if val[lastIx] != '0'
    val = val.slice(0,lastIx)
  return val


FaciesTractControl = (props)->
  {faciesTracts} = useContext(FaciesContext)
  if not faciesTracts?
    return null
  {interval, onUpdate} = props
  onUpdate ?= ->

  options = for item in faciesTracts
    {id, name} = item
    {value: id, label: name}

  currentVal = interval.facies_tract
  value = options.find (d)->d.value == currentVal
  value ?= null

  h Select, {
    id: 'facies-tract-select'
    options
    value
    selected: currentVal
    onChange: (res)->
      f = if res? then res.value else null
      onUpdate(f)
  }

updateInterval = (id, section, columns)->
  {TableName, update} = helpers
  tbl = new TableName("section_lithology", "section")

  s = helpers.update columns, null, tbl
  s += " WHERE id=#{id} AND section='#{section}'"
  await db.none(s)

class ModalEditor extends Component
  @defaultProps: {onUpdate: ->}
  constructor: (props)->
    super props
    @state = {
      facies: [],
      isAlertOpen: false
    }
  render: ->
    {interval, height, section} = @props
    return null unless interval?
    {id, top, bottom, facies} = interval
    hgt = fmt(height)
    txt = "interval starting at #{hgt} m"

    h Dialog, {
      className: "bp3-minimal"
      title: h IntervalEditorTitle, {
        title: "Section #{section}"
        interval
      }
      isOpen: @props.isOpen
      onClose: @props.closeDialog
      style: {top: '10%', zIndex: 1000, position: 'relative'}
    }, [
      h 'div.bp3-dialog-body', [
        h LithologyControls, {
          interval
          @update
        }
        h LabeledControl, {
          title: 'Grainsize'
          is: PickerControl
          vertical: false,
          isNullable: true,
          states: grainSizes.map (d)->
            {label: d, value: d}
          activeState: interval.grainsize
          onUpdate: (grainsize)=>
            @update {grainsize}
        }
        h Switch, {
          label: 'Covered'
          checked: interval.covered
          onChange: (d)=>
            @update {covered: not interval.covered}
        }
        h LabeledControl, {
          title: 'Surface expression'
          is: BoundaryStyleControl
          interval
          onUpdate: (d)=>@update {definite_boundary: d}
        }
        h LabeledControl, {
          title: 'Facies'
          is: FaciesPicker
          interval
          onChange: (facies)=>@update {facies}
        }
        h LabeledControl, {
          title: 'Facies tract'
          is: FaciesTractControl
          interval
          onUpdate: (facies_tract)=>@update {facies_tract}
        }
        h LabeledControl, {
          title: 'Surface type (parasequence)'
          is: PickerControl
          vertical: false,
          isNullable: true,
          states: surfaceTypes
          activeState: interval.surface_type
          onUpdate: (surface_type)=>
            @update {surface_type}
        }
        h LabeledControl, {
          title: 'Surface order'
          is: SurfaceOrderSlider
          interval
          onChange: @update
        }
        h LabeledControl, {
          title: 'Flooding surface (negative is regression)'
          is: PickerControl
          vertical: false,
          isNullable: true,
          states: floodingSurfaceOrders.map (d)->
            lbl = "#{d}"
            lbl = 'None' if not d?
            {label: d, value: d}
          activeState: interval.flooding_surface_order
          onUpdate: (flooding_surface_order)=>
            @update {flooding_surface_order}
        }
        h LabeledControl, {
          title: 'Correlated surface'
          is: CorrelatedSurfaceControl
          interval
          onChange: @update
        }
        h ButtonGroup, [
          h DeleteButton, {
            itemDescription: "the "+txt
            handleDelete: =>
              return unless @props.removeInterval?
              @props.removeInterval(id)
          }, "Delete this interval"
          h Button, {
            onClick: =>
              return unless @props.addInterval?
              @props.addInterval(height)
          }, "Add interval starting at #{fmt(height)} m"
        ]
      ]
    ]

  update: (columns)=>
    await updateInterval(@props.interval.id, @props.section, columns)
    @props.onUpdate()

class IntervalEditor extends Component
  @defaultProps: {
    onUpdate: ->
    onNext: ->
    onPrev: ->
    onClose: ->
  }
  constructor: (props)->
    super props
    @state = {
      facies: [],
      isAlertOpen: false
    }
  render: ->
    {interval, height, section} = @props
    return null unless interval?
    {id, top, bottom, facies} = interval
    hgt = fmt(height)

    width = @props.width or 340
    h 'div.interval-editor', {style: {padding: 10, zIndex: 50, backgroundColor: 'white', width}}, [
      h 'div.interval-editor-title', [
        h 'h3', "#{fmt(interval.bottom)}–#{fmt(interval.top)} m"
        h 'div.id', [
          h 'code', interval.id
        ]
      ]
      h LabeledControl, {
        title: 'Facies tract'
        is: FaciesTractControl
        interval
        onUpdate: (facies_tract)=>@update {facies_tract}
      }
      h LabeledControl, {
        title: 'Surface type'
        is: PickerControl,
        vertical: false,
        isNullable: true,
        states: surfaceTypes
        activeState: interval.surface_type
        onUpdate: (surface_type)=>
          @update {surface_type}
      }
      h LabeledControl, {
        title: 'Surface order'
        is: SurfaceOrderSlider
        interval
        onChange: @update
      }
      h LabeledControl, {
        title: 'Correlated surface'
        is: CorrelatedSurfaceControl,
        interval
        onChange: @update
      }
    ]
  updateFacies: (facies)=>
    {interval} = @props
    selected = facies.id
    if selected == interval.facies
      selected = null
    @update {facies: selected}

  update: (columns)=>
    await updateInterval(@props.interval.id, @props.section, columns)
    @props.onUpdate()


export {ModalEditor, IntervalEditor}
