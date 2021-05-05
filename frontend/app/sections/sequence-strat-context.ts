import React, { createContext, useMemo, useEffect } from "react";
import h from "@macrostrat/hyper";
import { useStoredState } from "@macrostrat/ui-components";

const noop = () => {};
interface SequenceStratState {
  showTriangleBars: boolean;
  showFloodingSurfaces: boolean;
  sequenceStratOrder: [number, number];
}
interface SequenceStratActions {
  updateState(val: SequenceStratState): void;
  toggleBooleanState(key: string): () => void;
}

type SequenceStratCtx = SequenceStratState & {
  actions: SequenceStratActions;
};

const defaultState: SequenceStratState = {
  showTriangleBars: true,
  showFloodingSurfaces: false,
  sequenceStratOrder: [0, 1],
};

const SequenceStratContext = createContext<SequenceStratCtx>({
  ...defaultState,
  actions: {
    updateState(val) {},
    toggleBooleanState(key) {
      return noop;
    },
  },
});

function SequenceStratProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useStoredState("sequence-strat", defaultState);

  // Merge initial state to handle edge cases
  // We should maybe integrate this error checking into the useStoredState hook
  useEffect(() => {
    let stateObj: SequenceStratState = state ?? {};

    // TODO: this is a hack to get display variables back the way we want them...
    // we should make this function much more robust and integrate wth other things...
    if (
      !Array.isArray(stateObj.sequenceStratOrder) ||
      stateObj.sequenceStratOrder.length == 2
    ) {
      delete stateObj.sequenceStratOrder;
    }
    stateObj = { ...defaultState, ...stateObj };

    setState(stateObj);
  }, []);

  const value = useMemo((): SequenceStratCtx => {
    return {
      ...state,
      actions: {
        updateState: (val) => setState(val),
        toggleBooleanState: (
          key: "showTriangleBars" | "showFloodingSurfaces"
        ) => () => {
          let newState = { ...state };
          newState[key] = !state[key];
          setState(newState);
        },
      },
    };
  }, [state]);
  return h(SequenceStratContext.Provider, { value }, children);
}

const SequenceStratConsumer = SequenceStratContext.Consumer;

export { SequenceStratProvider, SequenceStratConsumer, SequenceStratContext };
