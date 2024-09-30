/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import { Component } from "react";
import h from "@macrostrat/hyper";
import { NavLink, BackLink } from "../nav";
import { Icon } from "@blueprintjs/core";

class MapNavigationControl extends Component {
  render() {
    let settings = null;
    if (this.props.toggleLegend) {
      settings = h("li", [
        h("a", { onClick: this.props.toggleLegend }, [
          h(Icon, { icon: "info-sign", size: 24 }),
        ]),
      ]);
    }
    const { children } = this.props;

    const homeLink = null;
    try {
      h(NavLink, { to: "/" }, [h(Icon, { icon: "home", size: 24 })]);
    } catch (error) {
      ({});
    }

    return h("ul.controls", [homeLink, settings, children]);
  }
}

export { MapNavigationControl };
