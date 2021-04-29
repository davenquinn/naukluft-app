/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import {findDOMNode} from "react-dom";
import {Component} from "react";
import * as d3 from "d3";
import h from "react-hyperscript";
import createVisualization from ".";

class LateralVariation extends Component {
  render() {
    return h('div#lateral-variation');
  }
  componentDidMount() {
    const node = findDOMNode(this);
    return createVisualization(node);
  }
}

export default LateralVariation;
