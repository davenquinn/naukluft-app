/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import { Component } from "react";
import h from "@macrostrat/hyper";
import { CSSTransition } from "react-transition-group";
import { MapLegendList } from "./inner";

class LegendPanel extends Component {
  render() {
    if (!this.props.isActive) {
      return null;
    }
    return h(
      CSSTransition,
      {
        classNames: "settings",
        timeout: { exit: 1000, enter: 1000 },
      },
      [
        h("div#map-legend", { key: "legend" }, [
          h("div.legend-inner", {}, [
            h("div.title-block", [
              h("h1", "Geologic map of the southern Naukluft Mountains"),
              h("p", "Daven Quinn - Dissertation plate 4.1"),
              h("div.admonition", [
                h("p", "Preliminary version 4/18/2018"),
                h(
                  "p",
                  "Fault ticks, fold axes, bedding orientations, and unit labels are not rendered",
                ),
              ]),
            ]),
            h(MapLegendList),
          ]),
        ]),
      ],
    );
  }
}

export { LegendPanel };
