import h from "./index.module.sass";
import { ErrorBoundary } from "@macrostrat/ui-components";

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
  const compileDate = getCompileDate();

  const dateText = compileDate?.toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  });

  return h("footer.page-footer", [
    h("p", [
      "Created by ",
      h("a", { href: "https://davenquinn.com" }, "Daven Quinn"),
    ]),
    h.if(dateText != null)("p.last-updated", ["Last updated on ", dateText]),
  ]);
}

function getCompileDate(): Date | null {
  // @ts-ignore = The COMPILE_DATE variable is injected by Vite at build time
  const compileDate = COMPILE_DATE;

  if (compileDate == null || compileDate == "") {
    return null;
  }

  let parsedDate = compileDate;
  // We might have a JSON string
  if (compileDate.startsWith('"')) {
    parsedDate = JSON.parse(compileDate);
  }

  try {
    return new Date(parsedDate);
  } catch (e) {
    console.error(e);
    return null;
  }
}
