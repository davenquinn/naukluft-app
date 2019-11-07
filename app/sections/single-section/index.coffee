import {Component, useContext, useState} from "react"
import h from "@macrostrat/hyper"

import "../main.styl"
import {NavLink} from "../../nav"
import {SettingsPanel} from "../settings"
import LocalStorage from "../storage"
import {getSectionData} from "../section-data"
import {SectionComponent} from "./column"
import {PlatformContext} from "../../platform"
import {SectionNavigationControl} from "../util"
import {Notification} from "../../notify"
import {SettingsProvider, useSettings} from './settings'

SectionPageInner = (props)->
  # Set up routing to jump to a specific height
  {section, height: scrollToHeight} = props
  {inEditMode} = useContext(PlatformContext)
  settings = useSettings()

  # State to control whether we show settings panel
  [showSettings, setShowSettings] = useState(false)
  toggleSettings = -> setShowSettings(not showSettings)

  h 'div.page.section-page.single-section', [
    h 'div.left-panel', [
      h SectionNavigationControl, {toggleSettings}
      h 'div.panel-container', [
        h SectionComponent, {
          section...,
          scrollToHeight,
          offsetTop: 0
          key: section.id
          isEditable: inEditMode
          settings...
        }
      ]
    ]
    h.if(showSettings) SettingsPanel
  ]

SectionPage = (props)->
  h SettingsProvider, [
    h SectionPageInner, props
  ]

export default SectionPage
