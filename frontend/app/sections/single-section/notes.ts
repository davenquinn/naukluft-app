import { format } from "d3-format";
import { useState, useContext, useCallback, useMemo } from "react";
import h from "@macrostrat/hyper";
import { PlatformContext, Platform } from "~/platform";
import { NoteEditorContext, NotesColumn } from "@macrostrat/column-components";
import {
  ResultMask,
  useQueryRunner,
  useUpdateableQuery,
} from "naukluft-data-backend";

// import {
//   PhotoOverlay
// } from "@macrostrat/column-components/photos"
//

const fmt = format(".1f");

const PhotoLinks = function ({ photos }) {
  if (photos == null) {
    return null;
  }
  const [overlayShown, setOverlayShown] = useState(false);
  const toggleOverlay = () => setOverlayShown(!overlayShown);

  let tx = `${photos.length} photo`;
  if (photos.length > 1) {
    tx += "s";
  }

  return h([
    h("a.photos-link", { onClick: toggleOverlay }, tx),
    // h PhotoOverlay, {
    //   isOpen: overlayShown
    //   onClose: toggleOverlay
    //   photoIDs: photos
    // }
  ]);
};

const PhotoNoteComponent = function (props) {
  const { note } = props;
  const { note: text, photos } = note;

  const { setEditingNote, editingNote } = useContext(NoteEditorContext);
  const isEditing = editingNote === note;
  const visibility = isEditing ? "hidden" : "inherit";

  const onClick = () => setEditingNote(note);

  return h(
    "p.mc-note-label",
    {
      style: { visibility },
      xmlns: "http://www.w3.org/1999/xhtml",
      onClick,
    },
    [h("span.text", text), " ", h(PhotoLinks, { photos })]
  );
};

const ManagedNotesColumn = function (props) {
  const { id, ...rest } = props;
  const { platform, inEditMode } = useContext(PlatformContext);
  const dispatch = useQueryRunner();
  const params = useMemo(() => [id], [id]);

  const [baseNotes, updateNotes] = useUpdateableQuery(
    "section/notes/log-notes",
    params
  );

  const notes = baseNotes ?? [];

  const onUpdateNote = useCallback(
    async function (newNote, v) {
      if (newNote == null || dispatch == null) {
        return;
      }
      const { note: newText, id: noteID } = newNote;
      // We can't edit on the frontend
      if (newText.length === 0) {
        await dispatch(
          "section/notes/set-invisible",
          [noteID],
          ResultMask.none
        );
      } else {
        await dispatch("section/notes/update-note", [noteID], ResultMask.none);
      }
      updateNotes();
      console.log(`Note ${noteID} edited`);
    },
    [dispatch]
  );

  const editable = inEditMode;
  //if platform != Platform.ELECTRON
  //  onUpdateNote = null
  //  editable = false

  return h(NotesColumn, {
    notes,
    ...rest,
    noteComponent: PhotoNoteComponent,
    onUpdateNote,
    editable,
  });
};

export { ManagedNotesColumn };
