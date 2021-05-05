/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import { Component, createContext } from "react";
import "./main.styl";
import styles from "./section-index.styl";
// We should really resolve this from the /src directory...
import "@macrostrat/column-components/main.styl";
import h from "react-hyperscript";
import { Route, Switch, withRouter } from "react-router-dom";
import { NavLink } from "../nav";
import { SectionDataProvider, SectionConsumer } from "./data-providers";
import SectionPage from "./single-section";
import { SummarySections } from "./summary-sections";
import { GeneralizedSections } from "./generalized-sections";
import { SectionNavigationControl } from "./util";
import { FaciesDescriptionPage } from "./facies";
import { RegionalSectionsPage } from "./regional-sections";
import { nest } from "d3";
import ErrorBoundary from "react-error-boundary";

const SectionLink = function({ base, id }) {
  if (base == null) {
    base = "sections/";
  }
  return h(NavLink, { to: base + id }, [
    h("div", [h("div.title", [h("span", "Section "), h("span", id)])])
  ]);
};

class SectionIndexPage extends Component {
  render() {
    const { pathname } = this.props.location;

    const nestedSections = nest()
      .key(d => d.location)
      .entries(this.props.sections);

    const locations = nestedSections.map(function(nest) {
      const { key, values } = nest;
      return h("div.location", [
        h("h2", key),
        h(
          "ul.navigation.sections",
          values.map(d => h(SectionLink, { id: d.id }))
        )
      ]);
    });

    return h("div#homepage", [
      h(SectionNavigationControl),
      h("div#homepage-inner", [
        h(ErrorBoundary, [
          h("div.title-block", [
            h("h1", "Stratigraphic sections of the Zebra Nappe"),
            h("p.author", "Dissertation plate 5.2 – Daven Quinn"),
            h("p", `Summary sections can be used to access detailed sections`)
          ]),
          h("ul.navigation", [
            h(NavLink, { to: `${pathname}/summary` }, [
              h("div.title.summary-sections", "Summary sections")
            ]),
            h(NavLink, { to: `${pathname}/generalized` }, [
              h("div.title", "Generalized sections")
            ]),
            h(NavLink, { to: `${pathname}/regional` }, [
              h("div.title.regional", "Regional cross section")
            ])
          ]),
          ...locations
        ])
      ])
    ]);
  }
}

const wrapWithSections = component => props => {
  return h(SectionConsumer, null, sections => {
    if (sections.length === 0) {
      return h("div");
    }
    return h(component, { sections, ...props }, null);
  });
};

const SectionIndex = ({ match }) =>
  h(SectionDataProvider, [
    h(Switch, [
      h(Route, {
        path: match.url + "/",
        exact: true,
        render: withRouter(props => {
          return h(wrapWithSections(SectionIndexPage), props);
        })
      }),
      h(Route, {
        path: match.url + "/summary",
        exact: true,
        render: () => h(wrapWithSections(SummarySections))
      }),
      h(Route, {
        path: match.url + "/generalized",
        exact: true,
        render: () => {
          return h(wrapWithSections(GeneralizedSections));
        }
      }),
      h(Route, {
        path: match.url + "/facies-descriptions",
        exact: true,
        render: () => h(FaciesDescriptionPage, {}, null)
      }),
      h(Route, {
        path: match.url + "/regional",
        exact: true,
        render: () => h(RegionalSectionsPage, {}, null)
      }),
      h(Route, {
        path: match.url + "/:id/height/:height",
        render(props) {
          return h(SectionConsumer, null, function(sections) {
            const { id, height } = props.match.params;
            const section = sections.find(d => d.id === id);
            if (section == null) {
              return h("div");
            }
            return h(SectionPage, { section, height });
          });
        }
      }),
      h(Route, {
        path: match.url + "/:id/",
        render(props) {
          return h(SectionConsumer, null, function(sections) {
            const { id, height } = props.match.params;
            const section = sections.find(d => d.id === id);
            if (section == null) {
              return h("div");
            }
            return h(SectionPage, { section });
          });
        }
      })
    ])
  ]);

export { SectionIndex, SectionDataProvider };
