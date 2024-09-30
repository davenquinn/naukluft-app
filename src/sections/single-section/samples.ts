import { format } from "d3-format";
import { useContext } from "react";
import { ColumnContext } from "@macrostrat/column-components";
import { IsotopesDataContext } from "../summary-sections/chemostrat/data-manager";
import h from "@macrostrat/hyper";

const fmt = format("+.1f");

const Samples = (props: { section_id: string }) => {
  const { section_id } = props;
  const { scale, zoom } = useContext(ColumnContext);
  const { isotopes } = useContext(IsotopesDataContext);
  const samples = isotopes?.get(section_id);
  if (samples == null) return null;

  return h(
    "g.samples",
    samples.map((d) => {
      const y = scale(d.orig_height);
      const x = -40;
      const transform = `translate(${x} ${y})`;
      return h("g.sample", { transform, key: d.analysis_id }, [
        h("circle", { cx: 0, cy: 0, r: 2 * zoom }),
        h("text", { x: -10, y: -5 }, "∂¹³C " + fmt(d.avg_delta13c)),
        h("text", { x: -10, y: 5 }, "∂¹⁸O " + fmt(d.avg_delta18o)),
      ]);
    })
  );
};

export default Samples;
