import {Component, createContext, useContext} from "react"
import h from "react-hyperscript"
import {join, resolve} from "path"
import LocalStorage from "./sections/storage"
import update from "immutability-helper"
import {
  AssetPathProvider,
  AssetPathContext
} from '@macrostrat/column-components/dist/cjs/context'
import {
  GeologicPatternProvider
} from '@macrostrat/column-components'
## Set whether we are on the backend or frontend
global.ELECTRON = 'electron'
global.WEB = 'web'
global.PLATFORM = ELECTRON
global.SERIALIZED_QUERIES = false
global.BASE_DIR = null
try
  require 'electron'
  global.BASE_DIR = resolve join(__dirname,'..')
catch
  global.PLATFORM = WEB
  global.SERIALIZED_QUERIES = true
  global.BASE_URL = ""
console.log "Running application on #{PLATFORM}"

Platform = Object.freeze {
  ELECTRON: 1
  WEB: 2
  PRINT: 3
}

DarkModeContext = createContext(false)

DarkModeProvider = (props)->
  {children} = props
  try
    {systemPreferences} = require('electron')
    value = systemPreferences.isDarkMode()
  catch
    value = false
  h DarkModeContext.Provider, {value}, children

useDarkMode = ->
  useContext(DarkModeContext)

PlatformContext = createContext({})

class PlatformProvider extends Component
  constructor: (props)->
    platform = Platform.ELECTRON
    global.BASE_DIR ?= join(__dirname, "..")

    baseUrl = 'file://'+resolve(BASE_DIR)
    editable = true
    if global.PLATFORM == WEB
      platform = Platform.WEB
      editable = false
      baseUrl = "/"

    super props
    @state = {
      serializedQueries: not platform == Platform.ELECTRON
      inEditMode: false
      platform,
      editable,
      baseUrl
    }

    @storage = new LocalStorage 'edit-mode'
    v = @storage.get()
    return unless v?
    @state = update @state, {inEditMode: {$set: v}}

  render: ->
    {computePhotoPath, resolveSymbol, resolveLithologySymbol, updateState} = @
    {serializedQueries, restState...} = @state
    if @state.platform == Platform.WEB
      serializedQueries = true
    {children, rest...} = @props
    value = {
      rest...,
      restState...,
      serializedQueries,
      updateState,
      computePhotoPath,
      resolveSymbol,
      resolveLithologySymbol
    }

    {resolveSymbol} = @props
    if not resolveSymbol?
      resolveSymbol = @resolveSymbol

    assetPathFunctions = {resolveSymbol, resolveLithologySymbol}
    h DarkModeProvider, [
      h GeologicPatternProvider, {
        resolvePattern: @resolveLithologySymbol
      }, [
        h AssetPathProvider, {
          @resolveSymbol
        }, [
          h PlatformContext.Provider, {value}, children
        ]
      ]
    ]

  path: (args...)=>
    join(@state.baseUrl, args...)

  updateState: (val)=>
    @setState val

  computePhotoPath: (photo)=>
    return null unless photo.id?
    if @state.platform == Platform.ELECTRON
      return @path( '..', 'Products', 'webroot', 'Sections', 'photos', "#{photo.id}.jpg")
    else
      return @path( 'photos', "#{photo.id}.jpg")
    # Original photo
    return photo.path

  resolveSymbol: (sym)=>
    console.log(sym)
    try
      if @state.platform == Platform.ELECTRON
        q = resolve(join(BASE_DIR, 'assets', sym))
        return 'file://'+q
      else
        return join BASE_URL, 'column-symbols', sym
    catch
      return ''

  resolveLithologySymbol: (id, opts={})=>
    {svg} = opts
    svg ?= false
    return null if not id?
    if @state.platform == Platform.ELECTRON
      fp = "png/#{id}.png"
      if svg then fp = "svg/#{id}.svg"
      proj = process.env.PROJECT_DIR or ""
      q = join proj, "versioned/deps/geologic-patterns/assets", fp
      return 'file://'+q
    else
      return @path 'lithology-patterns', "#{id}.png"

  componentDidUpdate: (prevProps, prevState)->
    # Shim global state
    if prevState.serializedQueries != @state.serializedQueries
      global.SERIALIZED_QUERIES = @state.serializedQueries

    {inEditMode} = @state
    if prevState.inEditMode != inEditMode
      @storage.set {inEditMode}

PlatformConsumer = PlatformContext.Consumer

export {
  PlatformContext,
  Platform,
  PlatformProvider,
  PlatformConsumer,
  DarkModeContext,
  DarkModeProvider,
  useDarkMode
}
