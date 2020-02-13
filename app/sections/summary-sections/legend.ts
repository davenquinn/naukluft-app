/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import {Component} from "react";
import h from "react-hyperscript";
import classNames from "classnames";
import {SymbolLegend} from "@macrostrat/column-components/dist/esm/symbol-column";
import {FaciesContext} from "@macrostrat/column-components";
import {FaciesDescriptionSmall, FaciesSwatch} from "@macrostrat/column-components/dist/esm/editor/facies";

class FaciesLegend extends Component {
  static initClass() {
    this.defaultProps = {
      facies: [],
      onChanged() {},
      isEditable: true
    };
  }
  render() {
    return h('div.legend-inner', [
      h('div.facies-description', [
        h('h2', 'Sedimentary facies'),
        h('div.facies-description-inner', [
          h('div.section', [
            h('h4', 'Siliciclastic'),
            this.facies("coarse-clastics", "Coarse sandstone and pebble conglomerate"),
            this.facies("shallow-fine-clastics", "Inner shoreface sandstone–siltstone"),
            this.facies("fine-clastics", "Outer shoreface sandstone–mudstone")
          ]),
          h('div.section', [
            h('h4', 'Carbonate'),
            this.facies("knobbly-stromatolites", "Stromatolite-colonized reworking surface*"),
            this.facies("carbonate-mudstone"),
            this.facies("intraclast-grainstone"),
            this.facies("hcs-grainstone", "Cross-stratified grainstone"),
            this.facies("mixed-grainstone", 'Wavy-bedded heterolithic'),
            this.facies("intraclast-breccia", 'Intraclast breccia'),
            h('p.note', "*: not a stratigraphically continuous facies")
          ])
        ])
      ]),
      h('div.symbol-legend', [
        h('h2', 'Symbology'),
        h(SymbolLegend),
        h('p.note', 'Triangle bars represent variation in accomodation space at the parasequence set level')
      ])
    ]);
  }

  facies(id, title=null){
    const {selected, facies} = this.props;
    const d = facies.find(d => d.id === id);
    if ((d == null)) { return null; }
    const style = {};
    if (selected === d.id) {
      style.backgroundColor = d.color;
      style.color = 'white';
    }
    const className = classNames({selected: selected === d.id});

    return h('div.facies', {
      key: d.id, style, className
    }, [
      h('div.header', [
        h('p.name', title || d.name),
        h(FaciesSwatch, {facies: d})
      ])
    ]);
  }
}
FaciesLegend.initClass();

class Legend extends Component {
  render() {
    return h('div.legend#summary-sections-legend', {
      style: {
        position: 'absolute',
        left: 500,
        top: 25
      }
    },
    [
      h(FaciesContext.Consumer, null, props=> {
        return h(FaciesLegend, props);
      })
    ]);
  }
}

export {Legend};
