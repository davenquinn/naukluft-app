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

function resolveSymbol(sym) {
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

const Symbol = function (props) {
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
};

const SymbolDefs = function (props) {
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
      return h(Symbol, { symbol, ...rest });
    }),
  );
};

interface SymbolColumnProps {
  width: number;
  left: number;
  symbols: any[];
}

export function SymbolColumn(props: SymbolColumnProps) {
  const { scale, pixelHeight, zoom } = useContext(ColumnContext);
  const { left = 0, width = 30, symbols } = props;
  const patterns = symbols.filter((x, i, arr) => arr.indexOf(x) === i);

  const UUID = useUUID();

  let transform = null;
  if (left != null) {
    transform = `translate(${left})`;
  }

  const newSymbols = symbols
    .filter((d) => d.symbol_min_zoom < zoom)
    .map((d) => {
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
    });

  return h("g.symbol-column", { transform }, [
    h(SymbolDefs, { width, patterns, UUID }),
    h("rect.symbol-column-area", { width, height: pixelHeight }),
    h("g.symbols", newSymbols),
  ]);
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
