import { hyperStyled } from "@macrostrat/hyper";
import classNames from "classnames";
import { Drawer } from "@blueprintjs/core";
import styles from "./main.styl";
const h = hyperStyled(styles);

const AppDrawer = (props) => {
  const { className, children, ...rest } = props;
  return h(
    "div.app-drawer-outer",
    null,
    h(
      Drawer,
      {
        className: classNames(className, "app-drawer"),
        hasBackdrop: false,
        enforceFocus: false,
        canOutsideClickClose: false,
        ...rest,
      },
      h("div.content", null, children)
    )
  );
};

export { AppDrawer };
