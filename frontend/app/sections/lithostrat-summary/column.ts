import { hyperStyled } from "@macrostrat/hyper";
import { useSettings } from "@macrostrat/column-components";
import { SectionContainer } from "../components";
import { LithostratKey } from "../summary-sections/lithostrat-key";
import { Legend } from "../summary-sections/legend";
import { group } from "d3-array";
// This should be wrapped into a context
import { groupOrder } from "../summary-sections/display-parameters";
import { SVGSectionComponent } from "../summary-sections/column";
import { LayoutGroup } from "../summary-sections/layout/layout-group";
import {
  sectionOffsets,
  stackGroups,
} from "../summary-sections/display-parameters";
import { SectionPositions } from "../summary-sections/layout/defs";
import { useSectionPositions } from "../components/link-overlay";
import styles from "../summary-sections/main.styl";
import "../main.styl";

const h = hyperStyled(styles);

interface SectionPaneProps {
  scrollable: boolean;
  groupMargin: number;
  columnMargin: number;
  columnWidth: number;
  sections: SectionData[];
  tightenSpacing: boolean;
}

const SectionPane = function (props: SectionPaneProps) {
  let {
    sections,
    groupMargin,
    columnMargin,
    columnWidth,
    tightenSpacing,
    scrollable,
  } = props;

  const { showLegend } = useSettings();

  if (sections == null) {
    return null;
  }
  if (!(sections.length > 0)) {
    return null;
  }

  const row = sections.find((d) => d.id === "J");
  let { offset } = row;

  const overflow = scrollable ? "scroll" : "inherit";

  return h("div#section-pane", { style: { overflow } }, [
    h.if(showLegend)(Legend),
    h(SectionContainer, [
      h(LithostratKey, {
        zoom: 0.1,
        key: "key",
        offset,
      }),
      h("div#section-container", [
        h(ArrangedSections, {
          sections,
          groupMargin,
          columnMargin,
          columnWidth,
          tightenSpacing,
        }),
      ]),
    ]),
  ]);
};

SectionPane.defaultProps = {
  tightenSpacing: true,
  scrollable: true,
};

export { SectionPane };

// This might be a bad type declaration
const orderLike = <T, U>(arr: T[], accessor: (U) => T) => {
  return (a: U, b: U): number => {
    /*
    Function to sort an array like another array
    */
    let acc =
      accessor ??
      function (d) {
        return d;
      };
    return arr.indexOf(acc(a)) - arr.indexOf(acc(b));
  };
};

interface ArrangedSectionsProps {
  sections: SectionData[];
  groupMargin: number;
  location: string;
}

const sectionData = {
  section: "A",
  start: 0,
  end: 175,
  clip_end: 175,
  offset: "0",
  location: "Tsams",
  id: "A",
  range: [0, 175],
  height: 175,
  scaleFactor: 40.69714285714286,
};

function ArrangedSections(props: ArrangedSectionsProps) {
  const { tightenSpacing, groupMargin, location, ...rest } = props;
  const sections = [sectionData];

  console.log("Arranged sections", sections);

  // Divide sections into groups by location
  let groups = Array.from(group(sections, (d) => d.location));
  // Group order should become a rop or context
  groups.sort(orderLike(groupOrder, (d) => d[0]));

  ///let width = Math.max(...Object.values(useSectionPositions()).map(d => d.x+d.width))

  const outerStyle = {};

  return h(
    "div.grouped-sections",
    { style: outerStyle },
    groups.map((entry, i) => {
      const [location, sections]: [string, SectionData[]] = entry;
      let marginRight = groupMargin;
      // Tighten spacing for Onis and Naukluft
      if (tightenSpacing) {
        // if (location === 'Tsams') {
        //   marginRight = 0;
        // }
        if (i === 0) {
          marginRight /= 2.5;
        }
        if (i === 1) {
          marginRight = 30;
        }
      }

      if (location === "Tsams") {
        marginRight = 0;
      }

      let style = { marginRight };

      if (location === "Büllsport") {
        style = { position: "absolute", top: 0, right: 0 };
      }

      return h(SectionGroup, {
        key: location,
        location,
        style,
        sections,
        ...rest,
      });
    })
  );
}

function SectionColumn(props) {
  let { style } = props;
  style.position = "relative";
  style.width = style.width ?? 240;
  return h("div.section-column", { style }, props.children);
}

interface SectionGroupProps {
  sections: SectionData[];
  columnMargin: number;
  columnWidth: number;
  height: number;
  location: string;
}

const SectionGroup = (props: SectionGroupProps) => {
  const { sections, columnMargin, columnWidth, ...rest } = props;

  // Sort into columns within this group, using `stackGroups` variable
  let columns = group(sections, (d) =>
    stackGroups.findIndex((v) => v.includes(d.section))
  );
  columns = Array.from(columns);
  columns.sort((a, b) => a[0] - b[0]);
  const columnData: SectionData[][] = columns.map((a) => (a = a[1]));

  // Get topmost column position
  const sectionIDs = sections.map((d) => d.section);
  const pos: SectionPositions = useSectionPositions();
  const positions = Object.values(pos).filter((d) => sectionIDs.includes(d.id));
  const top = Math.min(...positions.map((d) => d.y));
  const height = Math.max(...positions.map((d) => d.y + d.height));
  const titleOffset = top - 120;

  return h(
    LayoutGroup,
    { titleOffset, ...rest },
    columnData.map((sections, i) => {
      let marginRight = columnMargin;

      if (i == columns.length - 1) marginRight = 0;

      const getWidth = (sections) => {
        for (let s of sections) {
          let sPos = pos[s.section];
          if (sPos != null) {
            const w = sPos.width + sPos.paddingLeft + sPos.paddingRight;
            if (w > 0) return w;
          }
        }
        return 150;
      };

      const width = getWidth(sections);
      //console.log(width)
      const style = { marginRight, height, width };

      return h(
        SectionColumn,
        { key: i, style },
        sections.map((row) => {
          let { offset } = row;
          const { start, clip_end: end, id } = row;
          offset = sectionOffsets[id] ?? offset;

          // Clip off the top of some columns...

          const height = end - start;

          return h(SVGSectionComponent, {
            zoom: 0.1,
            key: id,
            triangleBarRightSide: id == "J",
            showCarbonIsotopes: false,
            isotopesPerSection: false,
            offsetTop: 670 - height - offset,
            range: [start, end],
            height,
            start,
            end,
            id,
          });
        })
      );
    })
  );
};
