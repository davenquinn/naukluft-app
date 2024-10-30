import h from "./index.module.sass";
import { ErrorBoundary } from "@macrostrat/ui-components";
import { usePageContext } from "vike-react/usePageContext";

export function NavigationLayout({ children }) {
  return h("div.navigation-layout.text-page", [
    h(
      "div.inner",
      h(ErrorBoundary, [
        h("div.main", null, children),
        h("div.spacer"),
        h(Footer),
      ]),
    ),
  ]);
}

function Footer() {
  // @ts-ignore
  const env = usePageContext()?.runtimeEnv;
  console.log(env);

  let compileDate = JSON.parse(env?.COMPILE_DATE);

  return h("footer.page-footer", [
    h("p", [
      "Created by ",
      h("a", { href: "https://davenquinn.com" }, "Daven Quinn"),
    ]),
    h.if(compileDate != null)("p.last-updated", [
      "Last updated on ",
      new Date(compileDate).toLocaleString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
      }),
    ]),
  ]);
}
