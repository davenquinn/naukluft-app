import h from "@macrostrat/hyper";
import { BaseChemostratigraphyColumn } from "../summary-sections/chemostrat";
import { useContext } from "react";
import { IsotopesDataContext } from "../summary-sections/chemostrat/data-manager";

const IsotopeDataRescaler = ({ scale, children }) => {
  /** Rescales isotope data for generalized section view
   */
  let { isotopes, ...rest } = useContext(IsotopesDataContext);
  console.log(isotopes);

  isotopes?.forEach((value, key) => {
    isotopes.set(
      key,
      value.map((d) => {
        d.height = scale(d.height);
        return d;
      })
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

const ChemostratigraphyColumn = function (props) {
  const { sections, keySection, ...rest } = props;

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
  const scale = (d) => d - offset;

  return h(IsotopeDataRescaler, { scale }, [
    h(BaseChemostratigraphyColumn, {
      ...rest,
      keySection,
      sections,
      range,
    }),
  ]);
};

export { ChemostratigraphyColumn };
