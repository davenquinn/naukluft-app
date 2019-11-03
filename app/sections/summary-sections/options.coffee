import {Component, createContext} from "react"
import h from '@macrostrat/hyper'

defaultSectionOptions = {
  showFacies: true
  skeletal: false
}

SectionOptionsContext = createContext()

class SectionOptionsProvider extends Component
  render: ->
    {children, rest...} = @props
    value = {
      defaultSectionOptions...
      pixelsPerMeter: 2
      marginLeft: -10
      triangleBarsOffset: 80
      padding: {
        left: 30
        top: 10
        right: 20
        bottom: 10
      }
      rest...
    }
    h SectionOptionsContext.Provider, {value, children}

export {SectionOptionsContext, SectionOptionsProvider, defaultSectionOptions}
