import { useContext } from "react";
import {
  BaseChemostratigraphyColumn,
  SimpleChemostratigraphyColumn,
} from "../summary-sections/chemostrat";
import { IsotopesDataContext } from "../summary-sections/chemostrat/data-manager";
import hyper from "@macrostrat/hyper";

import styles from "./main.module.styl";
const h = hyper.styled(styles);

const IsotopeDataRescaler = ({ scale, children }) => {
  /** Rescales isotope data for generalized section view
   */
  let { isotopes, ...rest } = useContext(IsotopesDataContext);

  isotopes?.forEach((value, key) => {
    isotopes.set(
      key,
      value
        .map((d) => {
          d.height = scale(d.height);
          return d;
        })
        .filter((d) => d.height > 0),
    );
  });

  const value = { isotopes, ...rest };
  return h(IsotopesDataContext.Provider, { value, children });
};

IsotopeDataRescaler.defaultProps = {
  scaleFunc(d) {
    return d;
  },
};

export function GeneralizedChemostratigraphyColumn(props) {
  const { sections, keySection, simple, ...rest } = props;

  let row = sections[0];
  if (keySection != null) {
    row = sections.find((d) => d.key === keySection);
  }

  // We have inserted a shim first surface, so the
  // second surface is actually the secton's base
  const range = [
    row.surfaces[1].bottom,
    row.surfaces[row.surfaces.length - 1].top,
  ];

  const offset = row.surfaces[1].original_bottom - row.surfaces[1].bottom;

  // Apparently we are subtracting the offset twice??
  const scale = (d) => d - offset / 2;

  const component = simple
    ? SimpleChemostratigraphyColumn
    : BaseChemostratigraphyColumn;

  return h(IsotopeDataRescaler, { scale }, [
    h(component, {
      ...rest,
      keySection,
      simple,
      sections,
      range,
    }),
  ]);
}
