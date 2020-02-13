/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import '@babel/polyfill';

import React from "react";
import ReactDOM from "react-dom";
import {HashRouter,Route,Link, Switch, Redirect} from "react-router-dom";
import h from "react-hyperscript";
import {FocusStyleManager} from "@blueprintjs/core";
FocusStyleManager.onlyShowFocusOnTabs();
import {HotkeysTarget, Hotkeys, Hotkey} from "@blueprintjs/core";
import "@blueprintjs/core/lib/css/blueprint.css";

global.WEB_MODE=true;
import {PlatformProvider} from "../platform";
import {SectionIndex} from "../sections";


const route = (path, component, props={}) => h(Route, {...props, path,component});

class App extends React.Component {
  constructor() {
    super();
    this.state = {showNavBar: false};
  }
  render() {
    return h(PlatformProvider, [
      h('div#root', [
        h(Switch, [
          h(Route, {
            exact: true, path:'/', render: () => {
              return h(Redirect, {to: '/sections'});
            }
          }),
          route('/sections', SectionIndex)
        ])
      ])
    ]);
  }

  renderHotkeys() {
    console.log("Rendering hotkeys");
    return h(Hotkeys, {tabIndex: null}, [
      h(Hotkey, {
        global: true,
        combo: "r",
        label:"Reload",
        onKeyDown() { return console.log("Awesome!"); }
      })
    ]);
  }
}

// This doesn't work for unknown reasons
HotkeysTarget(App);

const Router = () => h(HashRouter, [
  h(App)
]);
ReactDOM.render(React.createElement(Router),document.querySelector('#main'));
