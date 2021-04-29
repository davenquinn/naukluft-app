/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import h from "@macrostrat/hyper";
import {useHistory} from "react-router";
import {NavLink, BackLink} from "../nav";
import {ButtonGroup, Button} from "@blueprintjs/core";
import T from "prop-types";
import {LinkButton} from '@macrostrat/ui-components';

const BackButton = function() {
  const history = useHistory();
  const onClick = () => history.goBack();
  return h(Button, {
    icon: 'arrow-left',
    size: 24,
    large: true,
    onClick
  });
};

const NavigationControl = function(props){
  const {toggleSettings, children} = props;
  return h(ButtonGroup, {className: 'controls'}, [
    h(BackButton),
    h(LinkButton, {to: '/', icon: 'home', large: true}),
    h.if(toggleSettings != null)(Button, {
      onClick: toggleSettings,
      icon: 'cog',
      large: true
    }),
    children
  ]);
};

export {BackButton, NavigationControl};
