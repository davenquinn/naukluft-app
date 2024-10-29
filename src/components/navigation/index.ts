import { Link, withRouter } from "react-router-dom";
import { useHistory } from "react-router";
import { LinkButton } from "~/components/buttons";

import h from "./index.module.sass";
import { Icon, ButtonGroup, Button } from "@blueprintjs/core";

export function NavLink({ to, children }) {
  return h("li", h(Link, { to }, children));
}

export const BackLink = withRouter((props) => {
  const { history } = props;
  return h("li", [
    h("a", { onClick: history.goBack }, [
      h(Icon, { icon: "arrow-left", iconSize: 24 }),
    ]),
  ]);
});

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

export const NavigationControl = function (props) {
  const { toggleSettings, children } = props;
  return h(ButtonGroup, { className: "controls" }, [
    h(BackButton),
    h(LinkButton, { to: "/", icon: "home", large: true }),
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
