import {Component, useContext, useState} from "react"
import h from "@macrostrat/hyper"

import "../main.styl"
import {NavLink} from "../../nav"
import LocalStorage from "../storage"
import {getSectionData} from "../data-providers"
import {SectionComponent} from "./column"
import {PlatformContext} from "../../platform"
import {BaseSectionPage} from '../components'
import {SectionNavigationControl} from "../util"
import {Notification} from "../../notify"
import {defaultSettings, SettingsPanel} from './settings'
import {useSettings} from '@macrostrat/column-components'
import styles from './main.styl'

SectionMain = (props)->
  # Set up routing to jump to a specific height
  {section, height: scrollToHeight, children} = props
  {inEditMode} = useContext(PlatformContext)
  settings = useSettings()

  h SectionComponent, {
    props...
    isEditable: inEditMode
    settings...
    children
  }

SectionPage = (props)->
  # Set up routing to jump to a specific height
  {section, height: scrollToHeight} = props

  h BaseSectionPage, {
    defaultSettings
    id: 'single-section'
    settingsPanel: SettingsPanel
  }, [
    h SectionMain, {
      section...,
      scrollToHeight,
      offsetTop: 0
      key: section.id
    }
  ]

export default SectionPage
