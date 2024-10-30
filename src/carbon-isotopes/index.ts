/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import { findDOMNode } from "react-dom";
import { Component } from "react";
import "./main.styl";
import * as d3 from "d3";
import "d3-selection-multi";
import "d3-jetpack";
import "d3-scale-chromatic";
import h from "@macrostrat/hyper";
import { runQuery } from "naukluft-data-backend";

class CarbonIsotopesPage extends Component {
  static initClass() {
    this.defaultProps = {
      margin: {
        top: 10,
        bottom: 50,
        left: 50,
        right: 10,
      },
      size: {
        width: 400,
        height: 800,
      },
    };
  }
  constructor(props) {
    super(props);
    this.state = { data: [] };
  }
  render() {
    return h("div#carbon-isotopes");
  }

  innerSize() {
    const { width, height } = this.props.size;
    const m = this.props.margin;
    return {
      width: width - m.left - m.right,
      height: height - m.top - m.bottom,
    };
  }

  componentDidMount() {
    runQuery("sections/carbon-isotopes").then((rows) => {
      console.log(rows);
      return this.setState({ data: rows });
    });

    const _el = findDOMNode(this);
    const el = d3.select(_el).append("svg").attrs(this.props.size);

    let { left, top } = this.props.margin;
    const inner = el.append("g").attr("transform", `translate(${left} ${top})`);

    const { width, height } = this.innerSize();

    this.x = d3.scaleLinear().domain([-16, 10]).range([0, width]);

    this.y = d3.scaleLinear().domain([-10, 700]).range([height, 0]);

    const b = d3.axisBottom().scale(this.x);

    const xax = inner.append("g").attrs({
      class: "scale x",
      transform: `translate(0 ${height})`,
    });

    xax.call(b);

    xax
      .append("foreignObject")
      .translate([width / 2, 20])
      .append("xhtml:div")
      .html("∂<sup>13</sup>C")
      .attrs({
        class: "axis-label",
      });

    const gg = inner
      .append("g.grid")
      .selectAll("line")
      .data(this.x.ticks())
      .attrs({ class: "grid" });

    gg.enter()
      .append("line")
      .translate((d) => [this.x(d), 0])
      .classed("zero", (d) => d === 0)
      .attrs({
        y0: 0,
        y1: height,
      });

    left = d3.axisLeft().scale(this.y);

    const yax = inner.append("g").attrs({ class: "scale y" });

    yax.call(left);

    yax
      .append("foreignObject")
      .at({
        transform: `translate(-50 ${height / 2 + 150}) rotate(-90)`,
        width: 350,
      })
      .append("xhtml:div")
      .html("Stratigraphic height (m) — <em>normalized to Section J</em>")
      .attrs({
        class: "axis-label",
      });

    return (this.dataArea = inner.append("g"));
  }

  componentDidUpdate(prevProps, prevState) {
    const nested = d3
      .nest()
      .key((d) => d.section)
      .entries(this.state.data);

    const cscale = d3.scaleOrdinal(d3.schemeCategory10);

    let sel = this.dataArea.selectAll("circle").data(this.state.data);

    const path = this.dataArea.selectAll("g.section").data(nested);

    const line = d3.line();

    const esel = path.enter().append("g");

    const locatePoint = (i) => {
      return [this.x(i.avg_delta13c), this.y(parseFloat(i.height))];
    };

    esel.append("path").attrs({
      class: "section",
      d: (d) => {
        const arr = d.values.map(locatePoint);
        return line(arr);
      },
      fill: "transparent",
      stroke(d, i) {
        return cscale(i);
      },
      "stroke-width": 2,
    });

    esel
      .append("text")
      .translate((d) => {
        const v = d.values[d.values.length - 1];
        return locatePoint(v);
      })
      .attrs({
        x: 5,
        y: 5,
        fill(d, i) {
          return cscale(i);
        },
      })
      .text((d) => d.key);

    const { x } = this;
    const { y } = this;
    return esel.each(function (d, i) {
      sel = d3.select(this).selectAll("circle").data(d.values);

      return sel
        .enter()
        .append("circle")
        .attrs({
          cx: (d) => x(d.avg_delta13c),
          cy: (d) => y(parseFloat(d.height)),
          fill(d) {
            return cscale(i);
          },
          r: 2,
        });
    });
  }
}
CarbonIsotopesPage.initClass();

export default CarbonIsotopesPage;
