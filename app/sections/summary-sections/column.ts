import {useContext} from "react"
import T from 'prop-types'
import {useSettings} from '@macrostrat/column-components'
import {useHistory} from "react-router-dom"

import {GrainsizeLayoutProvider, ColumnSVG, ColumnBox} from '@macrostrat/column-components'
import {ColumnAxis} from "@macrostrat/column-components/dist/cjs/axis"

import {ManagedSymbolColumn} from "../components"
import {FloodingSurface, TriangleBars} from "@macrostrat/column-components/dist/cjs/flooding-surface"
import {LithologyColumn, GeneralizedSectionColumn} from "@macrostrat/column-components/dist/cjs/lithology"
import {SequenceStratContext} from "../sequence-strat-context"
import {ColumnProvider, ColumnContext} from '@macrostrat/column-components'
import {SimplifiedLithologyColumn, CoveredOverlay, FaciesColumnInner} from '@macrostrat/column-components/dist/cjs/lithology'
import {DivisionEditOverlay} from '@macrostrat/column-components/dist/cjs/edit-overlay'

import {ColumnTracker} from '../components/link-overlay'
import {
 ColumnSurfacesProvider,
 ColumnSurfacesContext
} from '../column/data-source'
import {PlatformContext} from "../../platform"
import {IntervalEditor} from "../editor"
import {MinimalIsotopesColumn} from './chemostrat'
import {FaciesTractIntervals} from '../column/facies-tracts'

import {hyperStyled} from "@macrostrat/hyper"
import styles from "./main.styl"
const h = hyperStyled(styles)

const ColumnMain = function() {
 const {showFacies, showFaciesTracts, showLithology, showGrainsize} = useSettings()
 let c = GeneralizedSectionColumn
 let width = null
 if (!showGrainsize) {
   c = LithologyColumn
   width = 60
 }

 return h(c, {width}, [
   h.if(showFacies)(FaciesColumnInner),
   h.if(showFaciesTracts)(FaciesTractIntervals),
   h(CoveredOverlay),
   h.if(showLithology)(SimplifiedLithologyColumn)
 ])
}

const EditOverlay = function(props){
 let navigateTo: (arg0: string)=> void
 let {interactive} = useSettings()
 if (interactive == null) { interactive = false }
 if (!interactive) { return null }
 try {
   const history = useHistory()
   navigateTo = history.push
 } catch (error) {
   navigateTo = ()=>{}
 }
 let {id, ...rest} = props
 const onClick = function({height}){
   ({id} = props)
   let path = `/sections/${id}`
   if (height != null) {
     path += `/height/${height}`
   }

   console.log(height, path)
   navigateTo(path)
 }

 return h(DivisionEditOverlay, {
   showInfoBox: true,
   renderEditorPopup: (interval)=> {
     h.if(interval != null)(IntervalEditor, {interval})
   },
   onClick,
   ...rest
 })
}

const ColumnSummaryAxis = function(props){
 const {height, zoom, scale, pixelsPerMeter} = useContext(ColumnContext)
 const ratio = pixelsPerMeter*zoom

 // Keep labels from inhabiting the top few pixels (to make space for section labels)
 const topPadding = 30
 const maxVal = scale.domain()[1]-(topPadding/ratio)

 return h(ColumnAxis, {
   ticks: (height*zoom)/5,
   showLabel(d){ return d < maxVal }
 })
}

const ColumnIsotopes = function(props){
 const opts = useSettings()
 let {id, columnWidth} = props
 if (columnWidth == null) { columnWidth = 40 }
 if (!opts.isotopesPerSection) { return null }
 return h([
   h.if(opts.showCarbonIsotopes)(MinimalIsotopesColumn, {
     width: columnWidth,
     section: id,
     transform: 'translate(120)'
   }),
   h.if(opts.showOxygenIsotopes)(MinimalIsotopesColumn, {
     width: columnWidth,
     section: id,
     transform: 'translate(160)',
     system: 'delta18o'
   })
 ])
}

const calcColumnWidth = function(props){
 const {baseWidth} = props
 const o = useSettings()

 let width = baseWidth
 width += 40 // Symbol column

 if (o.isotopesPerSection) {
   if (o.showCarbonIsotopes) {
     width += 40
   }
   if (o.showOxygenIsotopes) {
     width += 40
   }
 }

 if (o.showTriangleBars) {
   width += 40
 }

 return width
}

const ColumnUnderlay = function(props){
 let {width, paddingLeft} = props
 const {pixelHeight} = useContext(ColumnContext)
 if (paddingLeft == null) { paddingLeft = 5 }
 return h('rect.underlay', {
   width,
   height: pixelHeight+10,
   x: -paddingLeft,
   y: -5,
   fill: 'white'
 })
}

const SVGSectionInner = function(props){
  let offsetLeft
  let {id, zoom, padding, lithologyWidth,
    innerWidth, onResize, marginLeft,
    showFacies,
    showWhiteUnderlay,
    height,
    range,
    offsetTop,
    marginTop,
    absolutePosition,
    children
  } = props

  const {inEditMode} = useContext(PlatformContext)

  const innerHeight = height*zoom

  const {left, top, right, bottom} = padding
  const {
    sequenceStratOrder,
    showFloodingSurfaces,
    showTriangleBars
  } = useContext(SequenceStratContext)


 const {
   showCarbonIsotopes,
   showOxygenIsotopes,
   isotopesPerSection
 } = useSettings()

 const outerHeight = innerHeight+(top+bottom)
 let outerWidth = innerWidth+(left+right)

 let {divisions} = useContext(ColumnSurfacesContext)
 divisions = divisions.filter(d => !d.schematic)

 const overhangLeft = 0
 const overhangRight = 0

 let overallWidth = 120
 overallWidth += 42 // Symbol column

 let chemostratWidth = 0
 if (isotopesPerSection) {
   if (showCarbonIsotopes) {
     chemostratWidth += 40
   }
   if (showOxygenIsotopes) {
     chemostratWidth += 40
   }
 }

 overallWidth += chemostratWidth

 const {triangleBarsOffset: tbo, triangleBarRightSide: onRight} = props
 marginLeft -= tbo
 const marginRight = 0
 outerWidth += tbo

 let triangleBarTranslate = 0
 let mainTranslate = 0


 let underlayPaddingLeft: number = left
 let underlayPaddingRight: number = 0
 let underlayWidth = 300

 if (showTriangleBars) {
   overallWidth += 40
   if (onRight) {
     triangleBarTranslate = 160+chemostratWidth
     underlayPaddingLeft = 0
     underlayWidth = 146
     overallWidth += 6
   } else {
     mainTranslate = 48
     offsetLeft = -tbo+35
     underlayPaddingLeft -= 35
   }
 }

 const floodingSurfaceStart = 42

 // Expand SVG past bounds of section

 // We need to change this!

 const grainsizeScaleStart = 40

 return h(ColumnProvider, {
   range,
   height: props.height,
   zoom: 0.1,
   divisions
 }, [
   h(ColumnBox, {
     className: 'section-container',
     offsetTop,
     width: overallWidth,
     marginLeft: 0,
     marginRight: 0,
     absolutePosition
   }, [
     h('div.section-header', [
       h("h2", {style: {zIndex: 20, marginLeft: mainTranslate}}, id)
     ]),
     h(ColumnTracker, {
       className: 'section-outer', id,
       paddingTop: 10
     }, [
       h(GrainsizeLayoutProvider, {
         width: innerWidth,
         grainsizeScaleStart
       }, [
         h(EditOverlay, {
           id,
           allowEditing: true,
           left: left+mainTranslate,
           top: padding.top
         }),
         h(ColumnSVG, {
           width: overallWidth,
           paddingTop: padding.top,
           paddingBottom: padding.bottom,
           paddingLeft: padding.left
         }, [
           h.if(showWhiteUnderlay)(ColumnUnderlay, {
             width: underlayWidth,
             paddingLeft: underlayPaddingLeft,
           }),
           h('g.main', {transform: `translate(${mainTranslate})`},  [
             h.if(showFloodingSurfaces)(FloodingSurface, {
               offsetLeft: -floodingSurfaceStart,
               lineWidth: floodingSurfaceStart
             }),
             h(ColumnSummaryAxis),
             h(ColumnMain),
             h(ManagedSymbolColumn, {
               left: 90,
               id
             }),
             h(ColumnIsotopes, {
               id,
               columnWidth: props.isotopeColumnWidth
             })
           ]),
           h('g.sequence-strat', {transform: `translate(${triangleBarTranslate})`}, [
             h.if(showTriangleBars)(TriangleBars, {
               id,
               offsetLeft: 0,
               lineWidth: 20,
               orders: [
                 sequenceStratOrder,
                 sequenceStratOrder-1
               ]
             })
           ])
         ])
       ]),
       children
     ])
   ])
 ])
}


SVGSectionInner.defaultProps = {
 zoom: 1,
 inEditMode: false,
 skeletal: false,
 isotopeColumnWidth: 40,
 offsetTop: null,
 marginTop: null,
 useRelativePositioning: true,
 showTriangleBars: false,
 trackVisibility: false,
 innerWidth: 100,
 height: 100, // Section height in meters
 lithologyWidth: 40,
 showWhiteUnderlay: true,
 showFacies: true,
 absolutePosition: true,
 triangleBarsOffset: 0,
 triangleBarRightSide: false,
 onResize() {},
 marginLeft: -10,
 padding: {
   left: 30,
   top: 10,
   right: 20,
   bottom: 28
 }
}

SVGSectionInner.propTypes = {
 //inEditMode: T.bool
 range: T.arrayOf(T.number).isRequired,
 absolutePosition: T.bool,
 isotopesPerSection: T.bool,
 offsetTop: T.number
}


const SVGSectionComponent = function(props){
 const {id, divisions} = props
 return h(ColumnSurfacesProvider, {id, divisions}, h(SVGSectionInner, props))
}

export {SVGSectionComponent, SVGSectionInner}
