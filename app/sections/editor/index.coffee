import {findDOMNode} from "react-dom"
import {Component, useContext} from "react"
import {Dialog, Button, Intent, ButtonGroup, Alert, Slider, Switch} from "@blueprintjs/core"
import {DeleteButton} from '@macrostrat/ui-components'
import Select from 'react-select'
import {format} from "d3-format"

import {FaciesDescriptionSmall, FaciesCard} from "@macrostrat/column-components/dist/cjs/editor/facies"
import {FaciesContext, ColumnContext} from "@macrostrat/column-components/dist/cjs/context"
import {PickerControl} from "@macrostrat/column-components/dist/cjs/editor/picker-base"
import {LabeledControl, IntervalEditorTitle} from "@macrostrat/column-components/dist/cjs/editor/util"
#import "react-select/dist/react-select.css"

import {ColumnDivisionsContext} from "../column/data-source"
import {LithologyPicker, LithologySymbolPicker, FillPatternControl} from '@macrostrat/column-components/dist/cjs/editor/lithology-picker'
import {
  CorrelatedSurfaceControl,
  SurfaceOrderSlider,
  HorizontalPicker,
  BoundaryStyleControl
  RaisedSelect
} from '@macrostrat/column-components/dist/cjs/editor/controls'
import {FaciesPicker} from '@macrostrat/column-components/dist/cjs/editor/facies/picker'

import {grainSizes} from "@macrostrat/column-components/dist/cjs/grainsize"
import {IntervalShape} from '@macrostrat/column-components/dist/cjs/editor/types'
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

  options = faciesTracts.map (d)->
    {value: d.id, label: d.name}

  currentVal = options.find (d)->
    d.value == interval.facies_tract

  h RaisedSelect, {
    id: 'facies-tract-select'
    options
    isClearable: true
    value: currentVal
    onChange: (res)->
      onUpdate(res)
  }

updateInterval = (id, columns)->
  {TableName, update} = helpers
  tbl = new TableName("section_lithology", "section")

  s = helpers.update columns, null, tbl
  s += " WHERE id=#{id}"
  console.log s
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
          onUpdate: (option)=>
            facies_tract = option.value
            @update {facies_tract}
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
    await updateInterval(@props.interval.id, columns)
    @props.onUpdate()

class IntervalEditor extends Component
  @contextType: ColumnDivisionsContext
  @defaultProps: {
    onUpdate: ->
    onNext: ->
    onPrev: ->
    onClose: ->
  }
  render: ->
    {interval, height, section} = @props
    return null unless interval?
    {id, top, bottom, facies} = interval
    hgt = fmt(height)

    h 'div.interval-editor', [
      h LabeledControl, {
        title: 'Facies tract'
        is: FaciesTractControl
        interval
        onUpdate: (option)=>
          facies_tract = option.value
          @update {facies_tract}
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
    await updateInterval(@props.interval.id, columns)
    @context.updateDivisions()


export {ModalEditor, IntervalEditor}
