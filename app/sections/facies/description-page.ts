/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import {Component} from "react";
import h from "react-hyperscript";
import T from 'prop-types';
import {SectionNavigationControl} from "../util";
import classNames from "classnames";
import {FaciesDescriptionSmall} from '@macrostrat/column-components/dist/cjs/editor/facies/description';
import {FaciesSwatch} from '@macrostrat/column-components/dist/cjs/editor/facies/color-picker';

class FaciesDescriptionPage extends Component {
  static initClass() {
    this.defaultProps = {
      isEditable: false
    };
  }
  constructor(props){
    super(props);
    this.state = {
      options: {
        isEditable: false
      }
    };
  }

  render() {
    const __html = "";
    const dangerouslySetInnerHTML = {__html};
    return h('div.page.facies-descriptions.text-page', [
      h(SectionNavigationControl),
      h('div.facies-descriptions', {
        dangerouslySetInnerHTML
      })
   ]);
  }
}
FaciesDescriptionPage.initClass();

export {FaciesDescriptionPage, FaciesDescriptionSmall, FaciesSwatch};
