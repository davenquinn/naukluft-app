/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import { Component } from "react";

class SectionTemplate extends Component {
  render() {
    return h("div#map-root", {}, [
      h("div#map-panel-container", {}, [
        h(MapNavigationControl, { toggleLegend: this.toggleLegend }),
        h(MapPanel),
      ]),
      h(LegendPanel, { isActive: this.state.legendIsActive }),
    ]);
  }
}
