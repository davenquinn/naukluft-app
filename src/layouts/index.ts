import h from "./index.module.sass";
import { ErrorBoundary } from "@macrostrat/ui-components";

export function NavigationLayout({ children }) {
  return h("div.navigation-layout.text-page", [
    h("div.inner", h(ErrorBoundary, children)),
  ]);
}
