import {Component} from "react"
import h from "react-hyperscript"
import T from 'prop-types'
import {SectionNavigationControl} from "../util"
import classNames from "classnames"
import {FaciesDescriptionSmall} from '#/editor/facies/description'
import {FaciesSwatch} from '#/editor/facies/color-picker'

class FaciesDescriptionPage extends Component
  @defaultProps: {
    isEditable: false
  }
  constructor: (props)->
    super props
    @state = {
      options: {
        isEditable: false
      }
    }

  render: ->
    __html = ""
    dangerouslySetInnerHTML = {__html}
    h 'div.page.facies-descriptions.text-page', [
      h SectionNavigationControl
      h 'div.facies-descriptions', {
        dangerouslySetInnerHTML
      }
   ]

export {FaciesDescriptionPage, FaciesDescriptionSmall, FaciesSwatch}
