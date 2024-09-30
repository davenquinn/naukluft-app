import Router from "./main";
import "@babel/polyfill"; // this seems suspect
import ReactDOM from "react-dom";
import h from "@macrostrat/hyper";
import { FocusStyleManager } from "@blueprintjs/core";
FocusStyleManager.onlyShowFocusOnTabs();
import "@blueprintjs/core/lib/css/blueprint.css";
import "@blueprintjs/icons/lib/css/blueprint-icons.css";

let el = document.getElementById("app");
if (el == null) {
  el = document.createElement("div");
  el.id = "app";
  document.body.appendChild(el);
}

ReactDOM.render(h(Router), el);
