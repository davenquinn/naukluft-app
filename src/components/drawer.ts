import { hyperStyled } from "@macrostrat/hyper";
import classNames from "classnames";
import { Drawer, DrawerProps } from "@blueprintjs/core";
import styles from "./drawer.module.sass";
import React from "react";
const h = hyperStyled(styles);

type AppDrawerProps = {
  className?: string;
  children?: React.ReactNode;
} & DrawerProps;

const AppDrawer = (props: AppDrawerProps) => {
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
      h("div.content", null, children),
    ),
  );
};

export { AppDrawer };
