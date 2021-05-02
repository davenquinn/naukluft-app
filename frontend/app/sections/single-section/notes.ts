/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import {format} from "d3-format";
import {
  useState,
  useContext
} from "react";
import h from "@macrostrat/hyper";
import useAsyncEffect from 'use-async-effect';
import logNotesQuery from '../sql/log-notes.sql';
import updateNoteQuery from '../sql/update-note.sql';
import setNoteInvisible from '../sql/set-note-invisible.sql';
import {PlatformContext, Platform} from '~/platform';
import {
  NoteEditorContext,
  NotesColumn
} from "@macrostrat/column-components";

// import {
//   PhotoOverlay
// } from "@macrostrat/column-components/dist/esm/photos"
//
import {db, query, storedProcedure} from "~/db";

const fmt = format(".1f");

const PhotoLinks = function({photos}){
  if (photos == null) { return null; }
  const [overlayShown, setOverlayShown] = useState(false);
  const toggleOverlay = () => setOverlayShown(!overlayShown);

  let tx = `${photos.length} photo`;
  if (photos.length > 1) {
    tx += 's';
  }

  return h([
    h('a.photos-link', {onClick: toggleOverlay }, tx)
    // h PhotoOverlay, {
    //   isOpen: overlayShown
    //   onClose: toggleOverlay
    //   photoIDs: photos
    // }
  ]);
};

const PhotoNoteComponent = function(props){
  const {note} = props;
  const {note: text, photos} = note;

  const {setEditingNote, editingNote} = useContext(NoteEditorContext);
  const isEditing = editingNote === note;
  const visibility = isEditing ? 'hidden' : 'inherit';

  const onClick = () => setEditingNote(note);

  return h('p.mc-note-label', {
    style: {visibility},
    xmlns: "http://www.w3.org/1999/xhtml",
    onClick
  }, [
    h('span.text', text),
    " ",
    h(PhotoLinks, {photos})
  ]);
};


const ManagedNotesColumn = function(props){
  const {platform, inEditMode} = useContext(PlatformContext);

  const {id, ...rest} = props;
  let [notes, setNotes] = useState([]);

  // State management
  const updateNotes = async function() {
    notes = await query(logNotesQuery, [id]);
    console.log(notes);
    return setNotes(notes);
  };

  // Get initial notes from query
  useAsyncEffect(updateNotes, []);

  const onUpdateNote = async function(newNote, v){
    let sql;
    if (newNote == null) { return; }
    const {note: newText, id: noteID} = newNote;
    // We can't edit on the frontend
    if (platform !== Platform.ELECTRON) { return; }
    if (newText.length === 0) {
      sql = storedProcedure(setNoteInvisible);
      await db.none(sql, [noteID]);
    } else {
      sql = storedProcedure(updateNoteQuery);
      await db.none(sql, [noteID, newText]);
    }
    updateNotes();
    return console.log(`Note ${noteID} edited`);
  };

  const editable = inEditMode;
  //if platform != Platform.ELECTRON
  //  onUpdateNote = null
  //  editable = false

  return h(NotesColumn, {
    notes,
    ...rest,
    noteComponent: PhotoNoteComponent,
    onUpdateNote,
    editable
  });
};

export {ManagedNotesColumn};
