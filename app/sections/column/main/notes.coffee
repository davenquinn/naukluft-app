import {findDOMNode} from "react-dom"
import {format} from "d3-format"
import {Component, createElement, useState} from "react"
import h from "@macrostrat/hyper"
import T from "prop-types"

import {dirname} from 'path'
import {
  NotesColumn,
  NoteEditor,
  PhotoOverlay
} from "~/bundled-deps/column-components"
import {db, storedProcedure, query} from "~/sections/db"

fmt = format(".1f")
baseDir = dirname require.resolve '..'
sql = (id)-> storedProcedure(id, {baseDir})

PhotoLinks = ({photos})->
  return null unless photos?
  [overlayShown, setOverlayShown] = useState(false)
  toggleOverlay = =>
    setOverlayShown(not overlayShown)

  tx = "#{photos.length} photo"
  if photos.length > 1
    tx += 's'

  h [
    h 'a.photos-link', {onClick: toggleOverlay }, tx
    h PhotoOverlay, {
      isOpen: overlayShown
      onClose: toggleOverlay
      photoIDs: photos
    }
  ]

PhotoNoteComponent = (props)->
  {note, editable} = props
  editable ?= false
  {note: text, photos} = note
  if not props.editHandler?
    editable = false
  visibility = if editable then 'hidden' else 'inherit'
  h [
    h.if(editable) NoteEditor, props
    h 'p.note-label', {
      style: {visibility}
      xmlns: "http://www.w3.org/1999/xhtml"
    }, [
      h 'span.text', text
      " "
      h PhotoLinks, {photos}
    ]
  ]


class ManagedNotesColumn extends Component
  constructor: (props)->
    super props
    @state = {notes: []}

  componentDidMount: =>
    @updateNotes()

  updateNotes: =>
    {id} = @props
    notes = await query 'log-notes', [id]
    @setState {notes}

  onUpdateNote: (noteID, newText)=>
    # We can't edit on the frontend
    return unless PLATFORM == ELECTRON
    {dirname} = require 'path'
    baseDir = dirname require.resolve '../..'
    if newText.length == 0
      sql = storedProcedure('set-note-invisible', {baseDir})
      await db.none sql, [noteID]
    else
      sql = storedProcedure('update-note', {baseDir})
      await db.none sql, [noteID, newText]
    @updateNotes()
    console.log "Note #{noteID} edited"

  render: ->
    {notes} = @state
    h NotesColumn, {
      notes,
      noteComponent: PhotoNoteComponent
      @onUpdateNote
      @props...
    }

export {ManagedNotesColumn}
