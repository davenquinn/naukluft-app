import { hyperStyled } from "@macrostrat/hyper";
import styles from "../main.styl";
import Box from "ui-box";

const h = hyperStyled(styles);

const GroupTitle = (props) => {
  const { children, ...rest } = props;
  return h(Box, { is: "h1", ...rest }, children);
};

function LayoutGroup(props) {
  const { width, children, className, titleOffset } = props;

  const name = props.name ?? props.location;
  const id = props.id ?? props.location;
  let style = { ...props.style, width };
  if (style.width == null) {
    style.width = width;
  }

  let titleProps = null;
  if (titleOffset != null) {
    titleProps = { position: "absolute", top: titleOffset };
  }

  return h("div.location-group", { id, style, className }, [
    h(GroupTitle, titleProps, name),
    h("div.location-group-body", null, children),
  ]);
}

export { LayoutGroup };
