/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const requireFoolWebpack = require("require-fool-webpack");
// Because webpack is super annoying
import "@babel/polyfill"; // this seems suspect

import { PlatformProvider } from "./platform";
import React from "react";
import { BrowserRouter, Route, Link, Switch } from "react-router-dom";
import h from "@macrostrat/hyper";
import { FocusStyleManager, Icon } from "@blueprintjs/core";
FocusStyleManager.onlyShowFocusOnTabs();

import { NavBar, NavLink } from "./nav";
import { SectionIndex } from "./sections";
import { CrossSectionsPage } from "./cross-sections";
//MapLegend = require './map-legend/component'
import CarbonIsotopesPage from "./carbon-isotopes";
import LateralVariation from "./lateral-variation";
import { MapView } from "./map-viewer";
import { HotkeysTarget, Hotkeys, Hotkey } from "@blueprintjs/core";
import "@blueprintjs/core/lib/css/blueprint.css";
import "@blueprintjs/icons/lib/css/blueprint-icons.css";
import { ErrorBoundary } from "@macrostrat/ui-components";
//import "@macrostrat/ui-components/lib/index.css"

const wrapNavBar = function(component) {
  return () =>
    h("div", { className: "page" }, [
      h(NavBar),
      h(ErrorBoundary, null, h(component))
    ]);
};

const Home = () =>
  h("div#homepage", [
    h("div#homepage-inner", [
      h("h1", "Naukluft Nappe Complex"),
      h(
        "p",
        "Data products of research in the Southern Naukluft mountains, for presentation on the web alongside journal publication"
      ),
      h("ul", { className: "navigation" }, [
        h(NavLink, { to: "/sections" }, "Sections"),
        h(NavLink, { to: "/cross-sections" }, "Structural cross-sections"),
        h(NavLink, { to: "/carbon-isotopes" }, "Carbon Isotopes"),
        h(NavLink, { to: "/lateral-variation" }, "Lateral Variation"),
        h(NavLink, { to: "/map" }, "Map")
        //h(NavLink, { to: "/map-legend" }, "Map legend")
      ])
    ])
  ]);

class App extends React.Component {
  constructor() {
    super();
    this._toggleNavBar = this._toggleNavBar.bind(this);
    this.state = { showNavBar: true };
  }
  render() {
    return h(PlatformProvider, [
      h("div#root", [
        h(Switch, [
          h(Route, { path: "/", component: Home, exact: true }),
          h(Route, { path: "/sections", component: SectionIndex }),
          h(Route, {
            path: "/carbon-isotopes",
            component: wrapNavBar(CarbonIsotopesPage)
          }),
          h(Route, {
            path: "/lateral-variation",
            component: wrapNavBar(LateralVariation)
          }),
          h(Route, { path: "/map", component: MapView }),
          //route '/map-legend', wrapNavBar(MapLegend)
          h(Route, { path: "/cross-sections", component: CrossSectionsPage })
        ])
      ])
    ]);
  }
  _toggleNavBar() {
    return this.setState({ showNavBar: !this.state.showNavBar });
  }

  renderHotkeys() {
    console.log("Rendering hotkeys");
    return h(Hotkeys, { tabIndex: null }, [
      h(Hotkey, {
        global: true,
        combo: "r",
        label: "Reload",
        onKeyDown() {
          return console.log("Awesome!");
        }
      })
    ]);
  }
}

// This doesn't work for unknown reasons
//HotkeysTarget(App);

const Router = () => h(BrowserRouter, [h(App)]);

export default Router;
