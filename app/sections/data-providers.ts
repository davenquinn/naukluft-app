/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import {getJSON} from "../util"
import {join} from "path"
import Promise from "bluebird"
import {Component, createContext, useContext} from "react"
import {useQuery} from '~/db'
import {db, query, storedProcedure} from "./db"
import {FaciesProvider} from "./facies"
import {LithologyProvider} from './lithology'
import {PlatformContext} from '../platform'
import {SequenceStratProvider} from "./sequence-strat-context"
import {
  PhotoLibraryProvider as BasePhotoLibraryProvider
} from '@macrostrat/column-components'
import {ColumnDivisionsProvider} from "./column/data-source"
import {SymbolProvider} from './components/symbols'
import h, {compose} from "@macrostrat/hyper"
import {IsotopesDataProvider} from './summary-sections/chemostrat/data-manager'
import sectionSurfaceQuery from "./sql/section-surface.sql"
import photoQuery from "./sql/photo.sql"
import sectionsQuery from "./sql/sections.sql"
import "./main.styl"

const sectionFilename = function(fn){
  if (PLATFORM === ELECTRON) {
    const dataDir = process.env.NAUKLUFT_DATA_DIR
    return join(dataDir, "Sections", "Digitized Images", "web-images", fn)
  } else {
    return join(BASE_URL, 'section-images', fn)
  }
}

function __range__(left, right, inclusive) {
  let range = []
  let ascending = left < right
  let end = !inclusive ? right : ascending ? right + 1 : right - 1
  for (let i = left; ascending ? i < end : i > end; ascending ? i++ : i--) {
    range.push(i)
  }
  return range
}


const getSectionData = async function(opts={}){
  if (opts.verbose == null) { opts.verbose = false }
  const fn = sectionFilename('file-info.json')
  const config = await getJSON(fn)

  const data = await query(sectionsQuery)
  return data.map(function(s){
    s.id = s.section.trim()
    const files = config[s.id] ?? []
    s.range = [s.start, s.end]
    // Height in meters
    s.height = s.end-s.start

    const scaleFactor = files.height/s.height
    if (opts.verbose) {
      console.log(`Section ${s.id} scale factor: ${scaleFactor} px/m`)
    }

    const sz = 427
    s.scaleFactor = scaleFactor
    s.imageFiles = __range__(1, files.n, true).map(function(i){
      const filename = sectionFilename(`section_${s.id}_${i}.png`)
      const remaining = files.height-((i-1)*sz)
      const height = remaining > sz ? sz : remaining
      return {width: sz, height, filename}})
    return s
  })
}

const PhotoLibraryProvider = function({children}) {
  const {computePhotoPath} = useContext(PlatformContext)
  const photos = useQuery(photoQuery)
  return h(BasePhotoLibraryProvider, {photos, computePhotoPath}, children)
}

const SectionDataContext = createContext({sections: []})

class SectionDataProvider extends Component {
  static initClass() {
    this.contextType = PlatformContext
  }
  constructor(props){
    super(props)
    this.state = {
      sections: [],
      surfaces: [],
      photos: []
    }
  }

  getInitialData() {
    getSectionData()
      .then(sections=> this.setState({sections}))
    return query(sectionSurfaceQuery)
      .then(surfaces=> this.setState({surfaces}))
  }

  componentDidMount() {
    return this.getInitialData()
  }

  render() {
    const {surfaces, sections} = this.state
    if (sections == null) return null
    console.log(sections)
    // Surfaces really shouldn't be tracked by facies provider
    return h(LithologyProvider, [
      h(ColumnDivisionsProvider, [
        h(SymbolProvider, [
          h(FaciesProvider, [
            h(PhotoLibraryProvider, [
              h(SequenceStratProvider, null, [
                h(IsotopesDataProvider, null, [
                  h(SectionDataContext.Provider, {value: {sections}}, this.props.children)
                ])
              ])
            ])
          ])
        ])
      ])
    ])
  }
}
SectionDataProvider.initClass()

const SectionConsumer = SectionDataContext.Consumer

export { getSectionData, SectionDataProvider, SectionConsumer, SectionDataContext }
