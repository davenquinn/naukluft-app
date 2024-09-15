import { hyperStyled } from "@macrostrat/hyper";
import {
  ColumnContext,
  ColumnAxis,
  expandDivisionsByKey,
  useColumnDivisions
} from "@macrostrat/column-components";
import { useGeneralizedDivisions } from "./data-provider";
import { useContext, useRef, useState, useLayoutEffect } from "react";
import styles from "./main.module.styl";
import { format } from "d3-format";
import { GeneralizedDivision } from "./types";
import { isMainFrame } from "process";

const fmt = format("i");

const h = hyperStyled(styles);

const GeneralizedAxis = function(props) {
  const { height, zoom, scale, pixelsPerMeter } = useContext(ColumnContext);
  const ratio = pixelsPerMeter * zoom;

  // Keep labels from inhabiting the top few pixels (to make space for section labels)
  const topPadding = 30;
  const maxVal = scale.domain()[1] - topPadding / ratio;

  return h(ColumnAxis, {
    ticks: height * zoom,
    tickSize: 3,
    showLabel(d) {
      return false;
    }
  });
};

interface SectionBreakProps {
  division: GeneralizedDivision;
  textPadding?: number;
}

const SectionBreak = (props: SectionBreakProps) => {
  const { scaleClamped } = useContext(ColumnContext);
  const { division: d } = props;
  const btm = scaleClamped(d.bottom);
  const top = scaleClamped(d.top);
  const height = btm - top;
  const heightM = d.top - d.bottom;
  const textPadding = props.textPadding ?? 10;

  const ref = useRef<HTMLElement>();
  const [rect, setRect] = useState<DOMRect>(null);

  useLayoutEffect(() => {
    if (ref.current == null) return;
    const rect = ref.current.getBoundingClientRect();
    setRect(rect);
  }, [ref]);

  const textHeight = rect?.height ?? 0;
  const textWidth = rect?.width ?? 0;
  const showPrefix = textHeight < height - 2 * textPadding && textWidth < 30;

  return h(
    "div.section-break",
    {
      style: { height },
      className: `section-${d.original_section}`
    },
    [
      h("span", { ref }, [
        h("span.section-break-title", [
          h.if(showPrefix)("span.prefix", "Section "),
          h("span.section-id", `${d.original_section}`)
        ]),
        h("span.height", `${Math.round(heightM)} m`)
      ])
    ]
  );
};

const GeneralizedBreaks = props => {
  const divisions = useColumnDivisions();

  let breaks: GeneralizedDivision[] = expandDivisionsByKey(
    divisions.filter(d => d.original_section != null),
    "original_section"
  );
  breaks.reverse();

  return h(
    "div.generalized-breaks",
    breaks.map(division => h(SectionBreak, { division }))
  );
};

export { GeneralizedAxis, GeneralizedBreaks };
