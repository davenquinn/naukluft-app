import h from "@macrostrat/hyper";

export function Page() {
  return h("div.page", [
    h("h1", "Print figures"),
    h("ul", [
      h("li", [
        h("a", { href: "/print/generalized-sections" }, "Generalized sections"),
      ]),
      h("li", [
        h("a", { href: "/print/stratigraphic-model" }, "Stratigraphic model"),
    ]),
  ]);
}
