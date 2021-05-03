/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import { Component, createContext } from "react";
import h from "react-hyperscript";
import { db, storedProcedure, query } from "../../db";
import { FaciesContext } from "@macrostrat/column-components";
import setFaciesColorQuery from "./sql/set-facies-color.sql";
import faciesTractsQuery from "./sql/facies-tracts.sql";
import faciesQuery from "./sql/facies.sql";

class FaciesProvider extends Component {
  constructor(props) {
    super(props);
    this.state = {
      facies: [],
      faciesTracts: [],
      __colorMap: {},
    };
    this.getFaciesColor = this.getFaciesColor.bind(this);
  }

  getFaciesColor(id) {
    const { __colorMap } = this.state;
    return __colorMap[id] || null;
  }

  setFaciesColor = async (id, color) => {
    const sql = storedProcedure(setFaciesColorQuery);
    await db.none(sql, { id, color });
    return this.getFaciesData();
  };

  getFaciesData = async () => {
    const facies = await query(faciesQuery);
    const __colorMap = {};
    for (let f of Array.from(facies)) {
      __colorMap[f.id] = f.color;
    }

    return this.setState({ facies, __colorMap });
  };

  getFaciesTractData = async () => {
    const faciesTracts = await query(faciesTractsQuery);
    return this.setState({ faciesTracts });
  };

  componentDidMount() {
    this.getFaciesData();
    return this.getFaciesTractData();
  }

  render() {
    const { facies, faciesTracts } = this.state;
    const { children, ...rest } = this.props;
    const procedures = (() => {
      let getFaciesColor, setFaciesColor;
      return ({ getFaciesColor, setFaciesColor } = this);
    })();
    const value = {
      facies,
      faciesTracts,
      ...procedures,
      ...rest,
    };
    return h(FaciesContext.Provider, { value }, children);
  }
}

export { FaciesContext, FaciesProvider };
