import { Link, withRouter } from "react-router-dom";
import { useHistory } from "react-router";

import h from "./index.module.sass";
import { Icon, ButtonGroup, Button } from "@blueprintjs/core";

export function NavLink({ to, children }) {
  return h("li", h(Link, { to }, children));
}

export function BackButton() {
  const history = useHistory();
  const onClick = () => history.goBack();
  return h(Button, {
    icon: "arrow-left",
    size: 24,
    large: true,
    onClick,
  });
}

export function HomeButton() {
  const history = useHistory();
  const onClick = () => history.push("/");
  return h(Button, {
    icon: "home",
    size: 24,
    large: true,
    onClick,
  });
}

export const NavigationControl = function (props) {
  const { toggleSettings, children } = props;
  return h(ButtonGroup, { className: "controls" }, [
    h(BackButton),
    h(HomeButton),
    children,
    h.if(toggleSettings != null)(Button, {
      onClick: toggleSettings,
      icon: "cog",
      large: true,
    }),
  ]);
};

export function NavigationList({ children, className }) {
  return h("ul.navigation", { className }, children);
}
