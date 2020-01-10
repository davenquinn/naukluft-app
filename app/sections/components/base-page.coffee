import {useState} from "react"
import h from "@macrostrat/hyper"
import T from 'prop-types'
import {SectionNavigationControl} from "../util"
import {SettingsProvider} from '@macrostrat/column-components'
import classNames from 'classnames'

BaseSectionPage = (props)->
  {children, id, settingsPanel, defaultSettings, className, rest...} = props
  # State to control whether we show settings panel
  [showSettings, setShowSettings] = useState(false)
  toggleSettings = -> setShowSettings(not showSettings)

  className = classNames(className, id)
  console.log(children)

  h SettingsProvider, {
    storageID: id
    defaultSettings...
  }, [
    h 'div.page.section-page', {className}, [
      h 'div.left-panel', [
        h 'div.panel-container', [
          h SectionNavigationControl, {toggleSettings}
          children
        ]
      ]
      h.if(showSettings) settingsPanel
    ]
  ]

BaseSectionPage.propTypes = {
  className: T.string
  id: T.string.isRequired
  settingsPanel: T.elementType.isRequired
}

export {BaseSectionPage}
