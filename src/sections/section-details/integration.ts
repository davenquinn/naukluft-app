import "./main.styl";
// We should really resolve this from the /src directory...
import "@macrostrat/column-components/dist/main.css";
import h from "@macrostrat/hyper";
import { Route, Switch } from "react-router-dom";
import { NavLink } from "~/components";
import { SectionDetailSettings, Sequence } from ".";
import { sectionSwatches } from "./swatch-data";
import { ErrorBoundary } from "@macrostrat/ui-components";

const sectionKeys = Object.keys(sectionSwatches);

console.log(sectionKeys);

function SectionDetailsHomepage() {
  console.log("Homepage");
  return h("div#homepage", [
    h("div#homepage-inner", [
      h(ErrorBoundary, [
        h("ul.navigation", [
          sectionKeys.map((id) => {
            console.log(id);
            return h(NavLink, { to: `/sections/details/${id}`, key: id }, [
              h("h3", ["Group ", h("code", id)]),
            ]);
          }),
        ]),
      ]),
    ]),
  ]);
}

export const SectionDetailIndex = ({ base = "" }) => {
  console.log("Base", base);
  return h(SectionDetailSettings, [
    h(Switch, [
      h(Route, {
        path: "/sections/details/:id",
        render: (res) => h(Sequence, { id: res.match.params.id }),
      }),
      h(Route, {
        path: "",
        exact: true,
        render: () => h(SectionDetailsHomepage),
      }),
    ]),
  ]);
};
