import React, { useContext, createContext, useCallback } from "react";
import {
  Button,
  Intent,
  ButtonGroup,
  Switch,
  Tab,
  Slider
} from "@blueprintjs/core";
import { AppDrawer } from "~/components";
import { DeleteButton } from "@macrostrat/ui-components";
import { format } from "d3-format";

import { ColumnDivision, ColumnDivisionsContext } from "../column/data-source";
import {
  FaciesContext,
  PickerControl,
  LabeledControl,
  IntervalEditorTitle,
  LithologyPicker,
  LithologySymbolPicker,
  SurfaceOrderSlider,
  BoundaryStyleControl,
  RaisedSelect,
  FaciesPicker,
  grainSizes
} from "@macrostrat/column-components";
import {
  CorrelatedSurfaceControl,
  DivisionNavigationControl,
  Direction
} from "./controls";
import { updateSectionInterval } from "naukluft-data-backend";
import { SequenceStratControls } from "./sequence-strat";
import { hyperStyled } from "@macrostrat/hyper";
import styles from "./style.module.styl";
const h = hyperStyled(styles);

const floodingSurfaceOrders = [-1, -2, -3, -4, -5, null, 5, 4, 3, 2, 1];

const surfaceTypes = [
  { value: "mfs", label: "Maximum flooding surface" },
  { value: "sb", label: "Sequence boundary" }
];

type IntervalUpdateSpec = Partial<ColumnDivision>;
interface IntervalEditorCtx {
  interval: ColumnDivision;
  updateInterval(data: IntervalUpdateSpec): void;
}

const IntervalEditorContext = createContext<IntervalEditorCtx>({
  interval: null,
  updateInterval() {}
});

function IntervalEditorProvider({
  children,
  interval
}: React.PropsWithChildren<{ interval: ColumnDivision }>) {
  const { updateDivisions } = useContext(ColumnDivisionsContext);

  const updateInterval = useCallback(
    async (data: IntervalUpdateSpec) => {
      console.log(data);
      await updateSectionInterval(interval.id, data);
      // Update all divisions after editing
      updateDivisions();
    },
    [interval]
  );
  const value = {
    interval,
    updateInterval
  };
  return h(IntervalEditorContext.Provider, { value }, children);
}

const useIntervalEditor = () => useContext(IntervalEditorContext);

const LithologyControls = function(props) {
  const { interval, updateInterval } = useIntervalEditor();
  return h([
    h(LabeledControl, {
      title: "Lithology",
      is: LithologyPicker,
      interval,
      onChange: lithology => updateInterval({ lithology })
    }),
    h(LithologySymbolPicker, {
      interval,
      onChange: d => updateInterval({ fillPattern: d })
    })
  ]);
};

const _fmt = format(".2f");
const fmt = function(d) {
  let val = _fmt(d);
  for (let i = 0; i < 1; i++) {
    const lastIx = val.length - 1;
    if (val[lastIx] !== "0") {
      return val;
    }
    val = val.slice(0, lastIx);
  }
  return val;
};

const FaciesTractControl = function(props) {
  const { faciesTracts } = useContext(FaciesContext);
  if (faciesTracts == null) {
    return null;
  }
  let { interval, onUpdate } = props;
  if (onUpdate == null) {
    onUpdate = function() {};
  }

  const options = faciesTracts.map(d => ({
    value: d.id,
    label: d.name
  }));

  const currentVal = options.find(d => d.value === interval.facies_tract);

  return h(RaisedSelect, {
    id: "facies-tract-select",
    options,
    isClearable: true,
    value: currentVal,
    onChange(res) {
      return onUpdate(res);
    }
  });
};

interface IntervalControlsProps {
  height?: number;
  interval: ColumnDivision;
  addInterval(a0: number): void;
  removeInterval(a0: number): void;
}

const IntervalControls = (props: IntervalControlsProps) => {
  const { height, interval } = props;
  const hgt = fmt(height);
  const txt = ` (${hgt} m)`;

  let buttonText = "Add interval";
  if (height != null) buttonText += txt;

  return h(ButtonGroup, { className: "interval-controls", vertical: true }, [
    h(
      Button,
      {
        disabled: height == null,
        onClick: () => {
          if (props.addInterval == null) return;
          return props.addInterval(height);
        }
      },
      buttonText
    ),
    h(
      DeleteButton,
      {
        itemDescription: `the interval starting at ${fmt(interval.bottom)}`,
        handleDelete: () => {
          if (props.removeInterval == null) return;
          return props.removeInterval(interval.id);
        }
      },
      "Delete interval"
    )
  ]);
};

const MetaControls = props => {
  const { moveCursor, interval, section, children } = props;

  return h("div.meta-controls", [
    h(DivisionNavigationControl, {
      moveCursor,
      editingInterval: interval.id
    }),
    h(IntervalEditorTitle, {
      title: `Section ${section}`,
      interval
    }),
    children
  ]);
};

const ClearableSlider = props => {
  return h("div.clearable-slider", [
    h("div.inner", [
      h(Slider, {
        ...props,
        value: props.value ?? 10,
        showTrackFill: false
      })
    ]),
    h("div", [
      h(Button, {
        small: true,
        minimal: true,
        intent: Intent.DANGER,
        icon: "cross",
        disabled: props.value == null,
        onClick: evt => {
          props.onChange(null);
        }
      })
    ])
  ]);
};

const CorrelationControls = () => {
  const { interval, updateInterval } = useIntervalEditor();
  return h([
    h(LabeledControl, {
      title: "Correlated surface",
      is: CorrelatedSurfaceControl,
      interval,
      onChange: updateInterval
    }),
    h(LabeledControl, {
      is: ClearableSlider,
      title: "Surface certainty",
      value: interval.surface_certainty,
      onChange(c) {
        updateInterval({ surface_certainty: c });
      }
    })
  ]);
};

interface EditorProps {
  moveCursor(dir: Direction): void;
  addInterval(height: number): void;
  removeInterval(id: number): void;
  interval: ColumnDivision;
  height: number;
}

const DetailControls = () => {
  const { interval, updateInterval } = useIntervalEditor();
  return h("div.detail-controls", [
    h(LithologyControls, {
      interval,
      update: updateInterval
    }),
    h(LabeledControl, {
      title: "Grainsize",
      is: PickerControl,
      vertical: false,
      isNullable: true,
      states: grainSizes.map(d => ({
        label: d,
        value: d
      })),
      activeState: interval.grainsize,
      onUpdate(grainsize: string) {
        updateInterval({ grainsize });
      }
    }),
    h(Switch, {
      label: "Covered",
      checked: interval.covered,
      onChange: d => {
        return updateInterval({ covered: !interval.covered });
      }
    }),
    h(LabeledControl, {
      title: "Surface expression",
      is: BoundaryStyleControl,
      interval,
      onUpdate: d => updateInterval({ definite_boundary: d })
    })
  ]);
};

const SummaryControls = () => {
  const { interval, updateInterval } = useIntervalEditor();
  return h("div.summary-controls", [
    h(LabeledControl, {
      title: "Facies",
      is: FaciesPicker,
      interval,
      onChange(facies: number) {
        updateInterval({ facies });
      }
    }),
    h(LabeledControl, {
      title: "Facies tract",
      is: FaciesTractControl,
      interval,
      onUpdate: option => {
        const facies_tract = option.value;
        return updateInterval({ facies_tract });
      }
    }),
    h(SequenceStratControls, { updateInterval, interval }, [
      h(
        Tab,
        {
          id: "correlation",
          panel: h(CorrelationControls, { interval, updateInterval })
        },
        "Correlations"
      )
    ])
  ]);
};

const EditorInner = (props: EditorProps) => {
  const {
    interval,
    height,
    moveCursor,
    addInterval,
    removeInterval,
    showDetails
  } = props;
  if (interval == null) return null;

  return h(
    IntervalEditorProvider,
    { interval },
    h("div.editor-inner", [
      h(
        MetaControls,
        {
          section: interval.section_id,
          interval,
          moveCursor
        },
        [
          h.if(showDetails)(IntervalControls, {
            interval,
            height,
            addInterval,
            removeInterval,
            vertical: true,
            small: true
          })
        ]
      ),
      h.if(showDetails)(DetailControls),
      h(SummaryControls)
    ])
  );
};

interface ModalEditorProps extends EditorProps {
  closeDialog: () => void;
  isOpen: boolean;
}

const ModalEditor = (props: ModalEditorProps) => {
  const { interval, isOpen, closeDialog, ...rest } = props;

  const { updateDivisions } = useContext(ColumnDivisionsContext);

  return h(
    AppDrawer,
    {
      className: "bp5-minimal editor-drawer",
      title: "Edit interval",
      isOpen,
      onClose: closeDialog
    },
    [
      h(EditorInner, {
        interval,
        ...rest,
        onUpdate() {
          updateDivisions();
        }
      })
    ]
  );
};

ModalEditor.defaultProps = {
  onUpdate() {},
  showDetails: false
};

export { Direction, ModalEditor };
