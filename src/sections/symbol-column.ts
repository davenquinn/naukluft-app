import { useContext } from "react";
import h from "@macrostrat/hyper";
import classNames from "classnames";
import { ColumnContext, useUUID } from "@macrostrat/column-components";

const columnPatterns = import.meta.glob("../../assets/column-patterns/*.svg", {
  eager: true,
  import: "default",
});

const symbolIndex = {
  "Hummocky cross-stratified": "hcs.svg",
  "Trough cross-stratified": "tcs.svg",
  "Dessication cracks": "dessication-cracks.svg",
  Ooids: "ooids.svg",
  "Domal stromatolites": "domal-stromatolites.svg",
  "Digitate stromatolites": "digitate-stromatolites.svg",
};

// Symbols

export interface Symbol {
  id: number;
  section_id: string;
  height: number;
  start_height: number;
  end_height: number | null;
  symbol: string;
}

function resolveSymbol(sym: string) {
  if (sym == null) {
    return null;
  }
  let sym1 = sym;
  // Just in case we are passing full names
  if (sym1.endsWith(".svg")) {
    sym1 = sym1.slice(0, -4);
  }
  return columnPatterns[`../../assets/column-patterns/${sym1}.svg`];
}

function SymbolImage(props) {
  const { symbol, width, height, UUID } = props;
  const id = `${UUID}-${symbol}`;
  const symbolSize = { width };
  const href = resolveSymbol(symbolIndex[symbol]);

  return h(
    "symbol",
    {
      id,
      key: id,
      ...symbolSize,
    },
    [
      h("image", {
        href,
        x: 0,
        y: 0,
        ...symbolSize,
      }),
    ],
  );
}

// Approximate symbol height in pixels for 30px width
// In the future, we could measure the SVG files and maintain an index
const approxSymbolHeight = 18;

function SymbolDefs(props) {
  const { patterns, ...rest } = props;
  const ids = [];
  return h(
    "defs",
    patterns.map(function (sym) {
      const { symbol } = sym;
      if (ids.includes(symbol)) {
        return null;
      }
      ids.push(symbol);
      return h(SymbolImage, { symbol, ...rest });
    }),
  );
}

interface SymbolColumnProps {
  width: number;
  left: number;
  symbols: any[];
  maxShiftAmount?: number;
  condense?: boolean;
}

export function SymbolColumn(props: SymbolColumnProps) {
  const { scale, pixelHeight, zoom } = useContext(ColumnContext);
  const {
    left = 0,
    width = 30,
    symbols,
    condense = true,
    maxShiftAmount = 3,
  } = props;
  const patterns = symbols.filter((x, i, arr) => arr.indexOf(x) === i);

  const UUID = useUUID();

  let transform = null;
  if (left != null) {
    transform = `translate(${left})`;
  }

  const newSymbols = symbols.filter((d) => d.symbol_min_zoom < zoom);

  const condensedSymbols = condense
    ? condenseSymbols(newSymbols, scale, { maxShiftAmount })
    : newSymbols;

  return h("g.symbol-column", { transform }, [
    h(SymbolDefs, { width, patterns, UUID }),
    h("rect.symbol-column-area", { width, height: pixelHeight }),
    h(
      "g.symbols",
      condensedSymbols.map((d) => {
        const { symbol, id, height } = d;
        const className = classNames({ symbol }, "symbol");

        const y = scale(height) - width / 2;
        if (y < 0 || y > pixelHeight) return null;

        const href = `#${UUID}-${symbol}`;
        return h("use", {
          className,
          y,
          x: 0,
          width,
          xlinkHref: href,
          key: id,
        });
      }),
    ),
  ]);
}

interface SymbolGroup {
  symbols: Symbol[];
  start_height: number;
  end_height: number;
}

interface CondenseSymbolOptions {
  maxIterations?: number;
  maxShiftAmount: number;
  checkSpacing?: (a: Symbol, b: Symbol, pixelDistance: number) => boolean;
}

function condenseSymbols(
  symbols: Symbol[],
  scale,
  options: CondenseSymbolOptions = {},
): Symbol[] {
  /** Condense symbols by scale that are too close together. Instances of the same symbol
   * are removed while instances of different symbols are shifted apart (but not outside of their
   * original range). Densely overlapping symbols are ranked, and the rank can be used to
   * remove lower-priority symbols if desired.
   */

  const {
    maxIterations = 100,
    maxShiftAmount = 0,
    checkSpacing = defaultCheckSpacing,
  } = options;

  symbols.sort((a, b) => a.start_height - b.start_height);
  const result: Symbol[] = [];

  // First, iterate through and merge identical symbols that are too close
  for (let i = 0; i < symbols.length; i++) {
    const current = symbols[i];
    if (result.length === 0) {
      result.push(current);
      continue;
    }
    const last = result[result.length - 1];
    const pixelDistance = Math.abs(scale(current.height) - scale(last.height));
    if (
      current.symbol === last.symbol &&
      !checkSpacing(last, current, pixelDistance)
    ) {
      // Merge by averaging heights
      last.end_height = current.end_height ?? current.height;
      last.height = (last.height + current.height) / 2;
    } else {
      result.push(current);
    }
  }

  if (maxShiftAmount == 0) {
    return result;
  }

  // Force layout to adjust positions of different symbols that are too close
  // TODO: convert to actual D3 force simulation
  let overlapping = true;
  let iteration = 0;
  const _maxShiftAmount = Math.abs(
    scale.invert(maxShiftAmount) - scale.invert(0),
  );
  const shiftIncrement = _maxShiftAmount / 10;
  // Can shift any label
  let canShiftAny = true;
  while (overlapping && canShiftAny) {
    iteration += 1;
    if (iteration > maxIterations) {
      console.warn("Max iterations reached in condenseSymbols");
      break;
    }
    overlapping = false;
    for (let i = 1; i < result.length; i++) {
      const prev = result[i - 1];
      const current = result[i];
      const pixelDist = Math.abs(scale(current.height) - scale(prev.height));
      if (checkSpacing(prev, current, pixelDist)) {
        continue;
      }
      overlapping = true;
      // Check if we can shift them apart
      const canShiftPrev = prev.start_height - _maxShiftAmount < prev.height;
      const canShiftCurrent =
        (current.end_height ?? current.height) + _maxShiftAmount >
        current.height;

      if (canShiftPrev) {
        prev.height -= shiftIncrement;
      }
      if (canShiftCurrent) {
        current.height += shiftIncrement;
      }
      canShiftAny = canShiftAny && (canShiftPrev || canShiftCurrent);
    }
  }

  return result;
}

function defaultCheckSpacing(
  a: Symbol,
  b: Symbol,
  pixelDistance: number,
): boolean {
  return pixelDistance > approxSymbolHeight * 0.8;
}

export function SymbolLegend({ className }) {
  const arr = [];
  for (let name in symbolIndex) {
    const symbol = symbolIndex[name];
    const sym = h("div", { key: name }, [
      h("img.symbol-legend-swatch", { src: resolveSymbol(symbol) }),
      h("span.label", name),
    ]);
    arr.push(sym);
  }

  return h("div.symbol-legend", { className }, arr);
}
