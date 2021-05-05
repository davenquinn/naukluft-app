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

type SequenceStratCtx = SequenceStratState & SequenceStratActions;

const defaultState: SequenceStratState = {
  showTriangleBars: true,
  showFloodingSurfaces: false,
  sequenceStratOrder: [0, 1],
};

const SequenceStratContext = createContext<SequenceStratCtx>({
  ...defaultState,
  updateState(val) {},
  toggleBooleanState(key) {
    return noop;
  },
});

function SequenceStratProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useStoredState("sequence-strat", defaultState);

  // Merge initial state to handle edge cases
  // We should maybe integrate this error checking into the useStoredState hook
  useEffect(() => {
    const stateObj = state ?? {};
    setState({ ...defaultState, ...stateObj });
  }, []);

  const value = useMemo((): SequenceStratCtx => {
    return {
      ...state,
      updateState: (val) => setState(val),
      toggleBooleanState: (
        key: "showTriangleBars" | "showFloodingSurfaces"
      ) => () => {
        let newState = { ...state };
        newState[key] = !state[key];
        setState(newState);
      },
    };
  }, [state]);
  return h(SequenceStratContext.Provider, { value }, children);
}

const SequenceStratConsumer = SequenceStratContext.Consumer;

export { SequenceStratProvider, SequenceStratConsumer, SequenceStratContext };
