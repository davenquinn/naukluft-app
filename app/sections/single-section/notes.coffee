import {findDOMNode} from "react-dom"
import {format} from "d3-format"
import {
  Component,
  createElement,
  useState,
  useContext
} from "react"
import h from "@macrostrat/hyper"
import T from "prop-types"
import useAsyncEffect from 'use-async-effect'
import logNotesQuery from '../sql/log-notes.sql'
import updateNoteQuery from '../sql/update-note.sql'
import setNoteInvisible from '../sql/set-note-invisible.sql'
import {PlatformContext, Platform} from '~/platform'
import {useSettings} from '@macrostrat/column-components'
import {
  NoteEditor,
  NoteEditorContext,
  NotesColumn
} from "@macrostrat/column-components/dist/esm/notes"

# import {
#   PhotoOverlay
# } from "@macrostrat/column-components/dist/esm/photos"
#
import {db, query, storedProcedure} from "~/db"

fmt = format(".1f")

PhotoLinks = ({photos})->
  return null unless photos?
  [overlayShown, setOverlayShown] = useState(false)
  toggleOverlay = ->
    setOverlayShown(not overlayShown)

  tx = "#{photos.length} photo"
  if photos.length > 1
    tx += 's'

  h [
    h 'a.photos-link', {onClick: toggleOverlay }, tx
    # h PhotoOverlay, {
    #   isOpen: overlayShown
    #   onClose: toggleOverlay
    #   photoIDs: photos
    # }
  ]

PhotoNoteComponent = (props)->
  {note} = props
  {note: text, photos} = note

  {setEditingNote, editingNote} = useContext(NoteEditorContext)
  isEditing = editingNote == note
  visibility = if isEditing then 'hidden' else 'inherit'

  onClick = ->
    setEditingNote(note)

  h 'p.mc-note-label', {
    style: {visibility}
    xmlns: "http://www.w3.org/1999/xhtml"
    onClick
  }, [
    h 'span.text', text
    " "
    h PhotoLinks, {photos}
  ]


ManagedNotesColumn = (props)->
  {platform, inEditMode} = useContext(PlatformContext)

  {id, rest...} = props
  [notes, setNotes] = useState([])

  # State management
  updateNotes = ->
    notes = await query logNotesQuery, [id]
    console.log(notes)
    setNotes(notes)

  # Get initial notes from query
  useAsyncEffect(updateNotes, [])

  onUpdateNote = (newNote, v)->
    return unless newNote?
    {note: newText, id: noteID} = newNote
    # We can't edit on the frontend
    return unless platform == Platform.ELECTRON
    if newText.length == 0
      sql = storedProcedure(setNoteInvisible)
      await db.none(sql, [noteID])
    else
      sql = storedProcedure(updateNoteQuery)
      await db.none(sql, [noteID, newText])
    updateNotes()
    console.log "Note #{noteID} edited"

  editable = inEditMode
  #if platform != Platform.ELECTRON
  #  onUpdateNote = null
  #  editable = false

  h NotesColumn, {
    notes,
    rest...
    noteComponent: PhotoNoteComponent
    onUpdateNote
    editable
  }

export {ManagedNotesColumn}
