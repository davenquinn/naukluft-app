import { Component, createContext, useContext } from "react";
import h from "react-hyperscript";
import T from "prop-types";
import { query } from "~/db";
import q from "../sql/section-lithology.sql";

interface ColumnDivision {
  section_id: string;
  id: number;
  surface: number;
  bottom: number;
  top: number;
}

interface ColumnDivisionManager {
  divisions: ColumnDivision[];
  updateDivisions: () => void;
}

const ColumnDivisionsContext = createContext<ColumnDivisionManager>({
  divisions: [],
});

class ColumnDivisionsProvider extends Component {
  static propTypes = {
    id: T.string,
    divisions: T.arrayOf(T.object),
  };
  constructor(props) {
    super(props);
    let divisions: ColumnDivision[] = this.props.divisions;
    if (divisions == null) {
      divisions = [];
      this.updateDivisions();
    }
    this.state = { divisions };
  }

  updateDivisions = async () => {
    const { id } = this.props;
    console.log("Updating divisions for all columns.");
    let divisions = await query(q);
    if (id != null) {
      divisions = divisions.filter((d) => d.section_id === id);
    }
    return this.setState({ divisions });
  };

  render() {
    const { children } = this.props;
    const { divisions } = this.state;
    const { updateDivisions } = this;
    const value = { divisions, updateDivisions };
    return h(ColumnDivisionsContext.Provider, { value }, children);
  }
}

const useColumnDivisions = function (id: string) {
  const { divisions } = useContext(ColumnDivisionsContext);
  return divisions.filter((d) => d.section_id === id);
};

export {
  ColumnDivision,
  ColumnDivisionsContext,
  ColumnDivisionsProvider,
  useColumnDivisions,
};
