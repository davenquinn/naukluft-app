import {getJSON} from "../util"
import {join} from "path"
import Promise from "bluebird"
import {Component, createContext} from "react"
import {db, query, storedProcedure} from "./db"
import {FaciesProvider} from "./facies"
import {LithologyProvider} from './lithology'
import {PlatformContext} from '../platform'
import {SequenceStratProvider} from "./sequence-strat-context"
import {PhotoLibraryProvider} from '@macrostrat/column-components'
import h from "react-hyperscript"
import "./main.styl"
import {IsotopesDataProvider} from './summary-sections/chemostrat/data-manager'
import sectionSurfaceQuery from "./sql/section-surface.sql"
import photoQuery from "./sql/photo.sql"
import sectionsQuery from "./sql/sections.sql"

sectionFilename = (fn)->
  if PLATFORM == ELECTRON
    dataDir = process.env.NAUKLUFT_DATA_DIR
    return join dataDir, "Sections", "Digitized Images", "web-images", fn
  else
    return join BASE_URL, 'images', fn

getSectionData = (opts={})->
  opts.verbose ?= false
  fn = sectionFilename('file-info.json')
  config = await getJSON fn

  query sectionsQuery
    .map (s)->
      s.id = s.section.trim()
      files = config[s.id] or []
      s.range = [s.start, s.end]
      # Height in meters
      s.height = s.end-s.start

      scaleFactor = files.height/s.height
      if opts.verbose
        console.log "Section #{s.id} scale factor: #{scaleFactor} px/m"

      sz = 427
      s.scaleFactor = scaleFactor
      s.imageFiles = [1..files.n].map (i)->
        filename = sectionFilename("section_#{s.id}_#{i}.png")
        remaining = files.height-(i-1)*sz
        height = if remaining > sz then sz else remaining
        {width: sz, height, filename}
      return s

SectionContext = createContext({})

class SectionDataProvider extends Component
  @contextType: PlatformContext
  constructor: (props)->
    super props
    @state = {
      sections: []
      surfaces: []
      photos: []
    }

  getInitialData: ->
    getSectionData()
      .then (sections)=>@setState {sections}
    query(sectionSurfaceQuery)
      .then (surfaces)=>@setState {surfaces}
    query(photoQuery)
      .then (photos)=>@setState {photos}

  componentDidMount: ->
    @getInitialData()

  render: ->
    {surfaces, sections, photos} = @state
    {computePhotoPath} = @context
    # Surfaces really shouldn't be tracked by facies provider
    h LithologyProvider, [
      h FaciesProvider, {surfaces}, [
        h PhotoLibraryProvider, {photos, computePhotoPath}, [
          h SequenceStratProvider, null, [
            h IsotopesDataProvider, null, [
              h SectionContext.Provider, {value: {sections}}, @props.children
            ]
          ]
        ]
      ]
    ]

SectionConsumer = SectionContext.Consumer

export { getSectionData, SectionDataProvider, SectionConsumer }
