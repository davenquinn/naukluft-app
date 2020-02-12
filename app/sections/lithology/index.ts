/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import {Component} from "react";
import h from "react-hyperscript";
import {db, storedProcedure, query} from "../../db";
import {LithologyProvider} from '@macrostrat/column-components';
import q from "./lithology.sql";

class OurLithologyProvider extends Component {
  constructor(props){
    super(props);
    this.state = {lithologies: []};
  }

  getLithologies = async () => {
    const lithologies = await query(q);
    return this.setState({lithologies});
  };

  componentDidMount() {
    return this.getLithologies();
  }

  render() {
    const {lithologies} = this.state;
    const {children} = this.props;
    return h(LithologyProvider, {lithologies}, children);
  }
}

export {OurLithologyProvider as LithologyProvider};
