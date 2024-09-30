import h from "@macrostrat/hyper";
import { AnchorButton } from "@blueprintjs/core";

export function LinkButton(props) {
  const { to, icon, large = false } = props;
  return h(AnchorButton, { href: to, icon, large });
}
