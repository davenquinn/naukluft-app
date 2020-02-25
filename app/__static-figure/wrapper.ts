/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
/*
This will only build with Parcel
*/
import h from 'react-hyperscript';
import {PlatformProvider} from '../platform';
//import symbols from '../../assets/**/*.svg'
import {SectionDataProvider} from '../sections/data-providers';
import './fonts.css'
import './main.styl';

const resolveSymbol = function(sym){
  if (sym == null) { return null; }
  const [v1,v2] = sym.slice(0, -4).split("/");
  return __dirname+"/"+symbols[v1][v2];
};

const StaticFigureWrapper = function(props){
  const {children} = props;
  return h(PlatformProvider, {resolveSymbol}, [
    h(SectionDataProvider, [
      children
    ])
  ]);
};

export {StaticFigureWrapper};
