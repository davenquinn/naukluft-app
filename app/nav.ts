/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import React from "react";
import {Link, withRouter} from "react-router-dom";
import h from "react-hyperscript";
import style from "./main.styl";
import {Icon} from "@blueprintjs/core";

console.log(style);

class NavLink extends React.Component {
  render() {
    return h('li', [
      h(Link, {to: this.props.to}, this.props.children)
    ]);
  }
}


class BackLink extends React.Component {
  constructor(...args) {
    this.onClick = this.onClick.bind(this);
    super(...args);
  }

  render() {
    return h('li', [
      h('a', {onClick: this.onClick}, [
        h(Icon, {icon: 'arrow-left', iconSize: 24})
      ])
    ]);
  }
  onClick() {
    console.log("Going home");
    const {history} = this.props;
    return history.goBack();
  }
}

BackLink = withRouter(BackLink);

class NavBar extends React.Component {
  render() {
    return h('ul', {className: style.navBar}, [
      h(NavLink, {to: "/"}, "Home"),
      h(NavLink, {to: "/sections"}, "Sections"),
      h(NavLink, {to: "/carbon-isotopes"}, "Carbon Isotopes"),
      h(NavLink, {to: "/lateral-variation"}, "Lateral Variation"),
      h(NavLink, {to: "/map"}, "Map")
    ]);
  }
}

export { NavBar, NavLink, BackLink};
