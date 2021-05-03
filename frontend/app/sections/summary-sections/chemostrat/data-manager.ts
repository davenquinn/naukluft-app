import { createContext, useContext, Component } from "react";
import h from "@macrostrat/hyper";
import sql from "../../sql/all-carbon-isotopes.sql";
import { group } from "d3-array";
import { query } from "../../db";

const IsotopesDataContext = createContext(null);

class IsotopesDataProvider extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isotopes: null,
    };
    this.getData();
  }

  async getData() {
    const data = await query(sql);
    const isotopes = group(data, (d) => d.section);
    isotopes.forEach((values) =>
      values.sort((a, b) => a.orig_height - b.orig_height)
    );
    return this.setState({ isotopes });
  }

  render() {
    const { children } = this.props;
    return h(IsotopesDataContext.Provider, { value: this.state }, children);
  }
}

const useIsotopes = () => useContext(IsotopesDataContext).isotopes;

export { IsotopesDataProvider, IsotopesDataContext, useIsotopes };
