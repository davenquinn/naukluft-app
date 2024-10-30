import h from "@macrostrat/hyper";
import { createContext, useContext, useState } from "react";
import {
  ColumnDivision,
  ColumnDivisionsContext,
  useColumnDivisions,
} from "../column/data-source";
import { ModalEditor, Direction } from "../editor";

interface EditorCtx {
  onEditInterval: (arg0: ColumnDivision) => void;
  editingInterval?: ColumnDivision;
}

const EditorContext = createContext<EditorCtx>(null);

const EditorProvider = (props) => {
  const { children } = props;

  const allDivisions = useContext(ColumnDivisionsContext).divisions ?? [];

  const [editingIntervalIx, setEditingInterval] = useState<number>(null);
  const onEditInterval = (interval: ColumnDivision) => {
    const ix = allDivisions.findIndex((d) => d.id == interval.id);
    console.log(ix);
    setEditingInterval(ix);
  };
  const editingInterval = allDivisions[editingIntervalIx];

  const divisions = useColumnDivisions(editingInterval?.section_id) ?? [];

  const value = { editingInterval, onEditInterval };

  return h(EditorContext.Provider, { value }, [
    h(ModalEditor, {
      interval: editingInterval,
      isOpen: editingInterval != null,
      showDetails: false,
      closeDialog() {
        setEditingInterval(null);
      },
      moveCursor(dir: Direction) {
        let ix = divisions.findIndex((d) => d.id == editingInterval?.id);
        if (dir == Direction.Up) {
          ix += 1;
        } else if (dir == Direction.Down) {
          ix -= 1;
        }
        console.log(ix);
        ix = Math.min(Math.max(0, ix), divisions.length - 1);
        onEditInterval(divisions[ix]);
      },
    }),
    children,
  ]);
};

export { EditorProvider, EditorContext };
