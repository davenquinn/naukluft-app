import { hyperStyled } from "@macrostrat/hyper";
import { BaseSectionPage } from "../components/base-page";
import {
  SummarySectionsSettings,
  defaultSettings,
} from "../summary-sections/settings";
import { GeneralizedSections as GeneralizedSectionsInner } from "./main";

import "../summary-sections/main.styl";
import styles from "./main.styl";
const h = hyperStyled(styles);

const GeneralizedSections = (props) =>
  h(
    BaseSectionPage,
    {
      id: "generalized-sections",
      settingsPanel: SummarySectionsSettings,
      defaultSettings,
    },
    [h(GeneralizedSectionsInner)]
  );

export { GeneralizedSections };
