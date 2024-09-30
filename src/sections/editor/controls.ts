import { useContext } from "react";
import { RaisedSelect } from "@macrostrat/column-components";
import { ButtonGroup, Button } from "@blueprintjs/core";
import { SectionSurfacesContext } from "~/sections/providers";
import h from "@macrostrat/hyper";

const SurfaceLabel = (props) => {
  const d = props.surface;
  if (d == null) return null;
  return h("div.correlated-surface-row", [
    h("span.bp3-code", d.surface_id),
    " ",
    h("span", d.note),
  ]);
};

const CorrelatedSurfaceControl = (props) => {
  /** Control for correlated surfaces */
  const { surfaces, updateSurfaces } = useContext(SectionSurfacesContext);
  const { onChange, interval } = props;

  const seqSurfaces = surfaces.filter((d) => d.type == "sequence-strat");

  const options = seqSurfaces.map((d) => ({
    value: d.surface_id,
    label: h(SurfaceLabel, { surface: d }),
  }));

  const value = options.find((d) => d.value === interval.surface);

  return h(RaisedSelect, {
    options,
    isClearable: true,
    isSearchable: true,
    name: "selected-state",
    value,
    placeholder: "Choose a surface...",
    onChange: (surface) => {
      if (surface != null) {
        surface = surface.value;
      }
      onChange({ surface });
      updateSurfaces();
    },
  });
};

enum Direction {
  Up = "up",
  Down = "down",
}

interface NavigationControlProps {
  moveCursor: (direction: Direction) => void;
  editingInterval?: number;
}

const DivisionNavigationControl = (props: NavigationControlProps) => {
  const { moveCursor } = props;
  return h(ButtonGroup, { vertical: true, small: true }, [
    h(Button, {
      small: true,
      icon: "caret-up",
      onClick: () => moveCursor(Direction.Up),
    }),
    h(Button, {
      small: true,
      icon: "caret-down",
      onClick: () => moveCursor(Direction.Down),
    }),
  ]);
};

export { CorrelatedSurfaceControl, DivisionNavigationControl, Direction };
