/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import { findDOMNode } from "react-dom";
import { Component } from "react";
import * as d3 from "d3";
import "d3-selection-multi";
import "d3-jetpack";
import h from "react-hyperscript";
import createLegend from ".";
import "./main.styl";

class MapLegend extends Component {
  static initClass() {
    this.defaultProps = {};
  }
  constructor(props) {
    super(props);
    this.state = { data: [] };
  }
  render() {
    return h("div#map-legend");
  }

  componentDidMount() {
    const el = findDOMNode(this);
    return createLegend(el);
  }
}
MapLegend.initClass();

export default MapLegend;
