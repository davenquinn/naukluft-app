import h from 'react-hyperscript'
import {PlatformProvider} from '../../../platform'
import '../../../bundled-deps/column-components/src/main.styl'
import symbols from '../../../../assets/**/*.svg'
import {SectionDataProvider} from '../../section-data'
import './fonts.css'

resolveSymbol = (sym)->
  return null unless sym?
  [v1,v2] = sym.slice(0, -4).split("/")
  return __dirname+"/"+symbols[v1][v2]

StaticFigureWrapper = (props)->
  {children} = props
  h PlatformProvider, {resolveSymbol}, [
    h SectionDataProvider, [
      children
    ]
  ]

export {StaticFigureWrapper}
