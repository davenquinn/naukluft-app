/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import {render} from "react-dom";
import {createElement, Component} from "react";
import "./main.styl";
import {select} from "d3-selection";
import h from "react-hyperscript";
import moment from "moment";
import {getSectionData} from "../sections/data-providers";
import {SectionPanel} from "../sections/panel";
import CarbonIsotopesPanel from "../carbon-isotopes";
import LateralVariation from "../lateral-variation/component";
import "@blueprintjs/core/dist/blueprint.css";
import "../sections/main.styl";
import "../sections/settings.styl";
import "../main.styl";

module.exports = function(el, cb){
  //# Need to replace this with new code...
  //#sections = await getSectionData()

  class Page extends Component {
    render() {
      const date = moment().format('MMMM YYYY');
      return h('div.sections-print', [
        h('div.title-section', [
          h('h1', "Stratigraphy of the Zebra Nappe"),
          h('h2.info.location', "Southern Naukluft Mountains, Namibia"),
          h('h2.info.author', "Daven Quinn et al."),
          h('h2.info.date', `${date} version`)
        ]),
        h(SectionPanel, {sections, trackVisibility: false}),
        h('div.charts', [
          h('div', [
            h('h3', 'Schematic lithostratigraphy'),
            h(LateralVariation)
          ]),
          h('div', [
            h('h3', 'Carbon isotopes'),
            h(CarbonIsotopesPanel)
          ])
        ])
      ]);
    }
  }

  render(createElement(Page),el);

  const fn = () => cb();
  return setTimeout(fn, 5000);
};
