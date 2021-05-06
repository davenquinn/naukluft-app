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
import ReactDOM from "react-dom";
import { HashRouter, Route, Link, Switch } from "react-router-dom";
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

const wrapHomeButton = function(component) {
  let HomeButtonPage;
  return (HomeButtonPage = class HomeButtonPage extends React.Component {
    render() {
      return h("div.page", [
        h("ul.controls", [
          h(NavLink, { to: "/" }, [h(Icon, { icon: "home", size: 24 })])
        ]),
        h(component)
      ]);
    }
  });
};

const route = (path, component, props = {}) =>
  h(Route, { path, component, ...props });

class App extends React.Component {
  constructor() {
    super();
    this._toggleNavBar = this._toggleNavBar.bind(this);
    this.state = {};
    this.state.showNavBar = true;
  }
  render() {
    return h(PlatformProvider, [
      h("div#root", [
        h(Switch, [
          route("/", Home, { exact: true }),
          route("/sections", SectionIndex),
          route("/carbon-isotopes", wrapNavBar(CarbonIsotopesPage)),
          route("/lateral-variation", wrapNavBar(LateralVariation)),
          route("/map", MapView),
          //route '/map-legend', wrapNavBar(MapLegend)
          route("/cross-sections", CrossSectionsPage)
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
HotkeysTarget(App);

const Router = () => h(HashRouter, [h(App)]);

const navLink = function() {
  return h(NavLink, ...arguments);
};

var Home = () =>
  h("div#homepage", [
    h("div#homepage-inner", [
      h("h1", "Naukluft Nappe Complex"),
      h(
        "p",
        "Data products of research in the Southern Naukluft mountains, for presentation on the web alongside journal publication"
      ),
      h("ul", { className: "navigation" }, [
        navLink({ to: "/sections" }, "Sections"),
        navLink({ to: "/cross-sections" }, "Structural cross-sections"),
        navLink({ to: "/carbon-isotopes" }, "Carbon Isotopes"),
        navLink({ to: "/lateral-variation" }, "Lateral Variation"),
        navLink({ to: "/map" }, "Map"),
        navLink({ to: "/map-legend" }, "Map legend")
      ])
    ])
  ]);

let el = document.getElementById("app");
if (el == null) {
  el = document.createElement("div");
  el.id = "app";
  document.body.appendChild(el);
}

ReactDOM.render(React.createElement(Router), el);
