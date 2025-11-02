import h from "@macrostrat/hyper";

export function Page() {
  return h(
    "div",
    { style: { padding: "2rem", fontFamily: "sans-serif" } },
    h("h1", "Orientations Context Map"),
    h(
      "p",
      "This is a placeholder for the Orientations Context Map print page.",
    ),
  );
}
