/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import { Component } from "react";
import h from "@macrostrat/hyper";
import { LinkButton } from "@macrostrat/ui-components";
import { SVGNamespaces } from "@macrostrat/column-components";
import { NavigationControl as SectionNavigationControl } from "~/components";

class KnownSizeComponent extends Component {
  constructor(props) {
    super(props);
    Object.defineProperty(this, "width", { get: this.__width });
    Object.defineProperty(this, "height", { get: this.__height });
  }

  static __width() {
    return null;
  }
  static __height() {
    return null;
  }
}

const rangeForSection = function (row) {
  let { start, end, clip_end } = row;
  if (clip_end == null) {
    clip_end = end;
  }
  return [start, clip_end];
};

export {
  SectionNavigationControl,
  KnownSizeComponent,
  SVGNamespaces,
  rangeForSection,
};
