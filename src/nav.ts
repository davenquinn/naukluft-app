import { Link, withRouter } from "react-router-dom";
import h from "@macrostrat/hyper";
import { Icon } from "@blueprintjs/core";

function NavLink({ to, children }) {
  return h("li", h(Link, { to }, children));
}

const BackLink = withRouter((props) => {
  const { history } = props;
  return h("li", [
    h("a", { onClick: history.goBack }, [
      h(Icon, { icon: "arrow-left", iconSize: 24 }),
    ]),
  ]);
});

export { NavLink, BackLink };
