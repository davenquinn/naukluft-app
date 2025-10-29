import { useContext, useMemo } from "react";
import h from "@macrostrat/hyper";
import classNames from "classnames";
import { ColumnContext, useUUID } from "@macrostrat/column-components";
import {
  forceSimulation,
  forceY,
  forceCollide,
  SimulationNodeDatum,
} from "d3-force";

const columnPatterns = import.meta.glob("../../assets/column-patterns/*.svg", {
  eager: true,
  import: "default",
});

const symbolIndex: Record<string, string> = {
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

function resolveSymbol(sym: string | undefined | null) {
  if (sym == null) {
    return null;
  }
  let sym1 = sym;
  if (sym1.endsWith(".svg")) {
    sym1 = sym1.slice(0, -4);
  }
  return columnPatterns[`../../assets/column-patterns/${sym1}.svg`];
}

function SymbolImage(props: {
  symbol: string;
  width: number;
  height?: number;
  UUID: string;
}) {
  const { symbol, width, UUID } = props;
  const id = `${UUID}-${symbol}`;
  const symbolSize = { width, height: width };
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

const approxSymbolHeight = 18;

function SymbolDefs(props: { patterns: any[]; width: number; UUID: string }) {
  const { patterns, ...rest } = props;
  const ids: string[] = [];
  return h(
    "defs",
    patterns.map(function (sym: any) {
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
  symbols: Symbol[];
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
    maxShiftAmount = 5,
  } = props;
  const patterns = symbols.filter((x, i, arr) => arr.indexOf(x) === i);

  const UUID = useUUID();

  let transform = null;
  if (left != null) {
    transform = `translate(${left})`;
  }

  const newSymbols = useMemo(() => {
    const newSymbols = symbols.filter((d) => d.symbol_min_zoom < zoom);
    const condensedSymbols = condense
      ? condenseSymbols(newSymbols, scale, { maxShiftAmount })
      : newSymbols;
    return condensedSymbols;
  }, [symbols, scale, condense, maxShiftAmount, zoom]);

  const ph = pixelHeight ?? 0;

  return h("g.symbol-column", { transform }, [
    h(SymbolDefs, { width, patterns, UUID }),
    h("rect.symbol-column-area", { width, height: ph }),
    h(
      "g.symbols",
      newSymbols.map((d) => {
        const { symbol, id, height } = d;
        const className = classNames({ symbol }, "symbol");

        const y = scale(height) - width / 2;
        if (y < 0 || y > ph) return null;

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
  maxShiftAmount?: number; // pixels
  checkSpacing?: (a: Symbol, b: Symbol, pixelDistance: number) => boolean;
}

/** Node type used in the force simulation */
interface LabelNode extends SimulationNodeDatum {
  i: number;
  originalY: number;
  y: number;
  minY: number;
  maxY: number;
  radius: number;
  symbolIndex?: number;
  ref: Symbol;
}

function condenseSymbols(
  symbols: Symbol[],
  scale: any,
  options: CondenseSymbolOptions = {},
): Symbol[] {
  const {
    maxIterations = 1000,
    maxShiftAmount = 5, // pixels
    collisionBuffer = 10, // pixels
  } = options;

  if (!symbols || symbols.length === 0) return [];

  // Sort by data height
  const sorted = [...symbols].sort((a, b) => a.start_height - b.start_height);

  // Before simulation, remove duplicates of same symbol within spacing threshold
  const result: Symbol[] = [];
  for (const current of sorted) {
    if (result.length === 0) {
      result.push(current);
      continue;
    }
    const last = result[result.length - 1];
    const pixelDistance = Math.abs(scale(current.height) - scale(last.height));
    if (current.symbol === last.symbol && pixelDistance < collisionBuffer) {
      // merge by averaging heights
      last.end_height = current.end_height ?? current.height;
      last.height = (last.height + current.height) / 2;
    } else {
      result.push(current);
    }
  }

  // Create nodes for simulation with pixel positions
  const nodes: LabelNode[] = result.map((s, i) => {
    const origY = scale(s.height);
    const startPx = scale(s.start_height);
    const endPx = s.end_height != null ? scale(s.end_height) : origY;
    // Allow shift up to maxShiftAmount pixels beyond start/end
    const minY = Math.min(startPx, origY) - maxShiftAmount;
    const maxY = Math.max(endPx, origY) + maxShiftAmount;
    return {
      i,
      fx: 0,
      originalY: origY,
      y: origY,
      minY,
      maxY,
      radius: collisionBuffer,
      ref: s,
    } as LabelNode;
  });

  if (nodes.length <= 1) return sorted;

  // Force simulation:
  // - forceY attracts to originalY
  // - forceCollide prevents overlap
  // Clamp positions every tick to stay within minY/maxY
  let iteration = 0;
  const sim = forceSimulation<LabelNode>(nodes)
    .alphaDecay(0.05)
    .force("y", forceY<LabelNode>((d) => d.originalY).strength(2))
    .force("collide", forceCollide<LabelNode>((d) => d.radius).iterations(2))
    .stop();

  // Run the simulation manually to enforce bounds and max iterations
  while (sim.alpha() > 0.005 && iteration < maxIterations) {
    sim.tick();
    // clamp y values to allowed range after tick
    for (const n of nodes) {
      if (n.y < n.minY) n.y = n.minY;
      if (n.y > n.maxY) n.y = n.maxY;
    }
    iteration += 1;
  }
  // Stop simulation and clean up
  sim.stop();

  // Map updated pixel y back to data heights using scale.invert if available
  const hasInvert = typeof scale.invert === "function";
  return nodes.map((n) => {
    const newHeight = hasInvert ? scale.invert(n.y) : n.ref.height;
    return {
      ...n.ref,
      height: newHeight,
    };
  });
}

function defaultCheckSpacing(
  a: Symbol,
  b: Symbol,
  pixelDistance: number,
): boolean {
  return pixelDistance > approxSymbolHeight * 0.8;
}

export function SymbolLegend({ className }: { className?: string }) {
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
