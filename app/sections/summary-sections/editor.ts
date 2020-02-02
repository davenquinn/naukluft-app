import h from '@macrostrat/hyper'
import {createContext, useState} from 'react'
import {ColumnDivision} from '../column/data-source'
import {ModalEditor, Direction} from '../editor'

interface EditorCtx {
  onEditInterval: (arg0: ColumnDivision)=>void
  editingInterval?: ColumnDivision
}

const EditorContext = createContext<EditorCtx>(null)

const EditorProvider = props =>{
  const {children} = props

  const [editingInterval, setEditingInterval] = useState<ColumnDivision>(null)
  const onEditInterval = (interval: ColumnDivision)=>{
    setEditingInterval(interval)
  }

  const value = {editingInterval, onEditInterval}

  return h(EditorContext.Provider, {value}, [
    h(ModalEditor, {
      interval: editingInterval,
      isOpen: editingInterval != null,
      closeDialog() {setEditingInterval(null)},
      moveCursor(dir: Direction) {


      }
    }),
    children
  ])
}

export {EditorProvider, EditorContext}
