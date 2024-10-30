import { Component } from "react";
import h from "@macrostrat/hyper";
import { SectionNavigationControl } from "~/components";
import {
  FaciesDescriptionSmall,
  FaciesSwatch,
} from "@macrostrat/column-components";

class FaciesDescriptionPage extends Component {
  static initClass() {
    this.defaultProps = {
      isEditable: false,
    };
  }
  constructor(props) {
    super(props);
    this.state = {
      options: {
        isEditable: false,
      },
    };
  }

  render() {
    const __html = "";
    const dangerouslySetInnerHTML = { __html };
    return h("div.page.facies-descriptions.text-page", [
      h(SectionNavigationControl),
      h("div.facies-descriptions", {
        dangerouslySetInnerHTML,
      }),
    ]);
  }
}
FaciesDescriptionPage.initClass();

export { FaciesDescriptionPage, FaciesDescriptionSmall, FaciesSwatch };
