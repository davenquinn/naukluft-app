/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import {useState} from "react";
import h from "@macrostrat/hyper";
import T from 'prop-types';
import {SectionNavigationControl} from "../util";
import {Drawer} from "@blueprintjs/core";
import {SettingsProvider} from '@macrostrat/column-components';
import classNames from 'classnames';

const BaseSectionPage = function(props){
  let {children, id, settingsPanel, defaultSettings, className, ...rest} = props;
  // State to control whether we show settings panel
  const [showSettings, setShowSettings] = useState(false);
  const toggleSettings = () => setShowSettings(!showSettings);

  className = classNames(className, id);
  console.log(children);

  return h(SettingsProvider, {
    storageID: id,
    ...defaultSettings
  }, [
    h('div.page.section-page', {className}, [
      h('div.left-panel', [
        h('div.panel-container', [
          h(SectionNavigationControl, {toggleSettings}),
          children
        ])
      ]),
      h(settingsPanel, {
        isOpen: showSettings,
        onClose() { return setShowSettings(false); }
      })
    ])
  ]);
};

BaseSectionPage.propTypes = {
  className: T.string,
  id: T.string.isRequired,
  settingsPanel: T.elementType.isRequired
};

export {BaseSectionPage};
