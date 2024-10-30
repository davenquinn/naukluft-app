import { Component, createContext } from "react";
import h from "@macrostrat/hyper";
import { DarkModeProvider, LocalStorage } from "@macrostrat/ui-components";

import update from "immutability-helper";
import {
  AssetPathProvider,
  GeologicPatternProvider,
} from "@macrostrat/column-components";

// Vite glob imports of pattern
const patternSVGs = import.meta.glob(
  "../packages/geologic-patterns/assets/svg/*.svg",
  { eager: true, import: "default" },
);
const patternPNGs = import.meta.glob(
  "../packages/geologic-patterns/assets/png-compressed/*.png",
  {
    eager: true,
    import: "default",
  },
);

const columnPatterns = import.meta.glob("../assets/column-patterns/*.svg", {
  eager: true,
  import: "default",
});

let global = globalThis;

global.ELECTRON = "electron";
global.WEB = "web";

global.PLATFORM = WEB;
global.SERIALIZED_QUERIES = true;
global.BASE_URL = "/";
console.log(`Running application on ${PLATFORM}`);

const Platform = Object.freeze({
  ELECTRON: 1,
  WEB: 2,
  PRINT: 3,
});

function join(...args: string[]): string {
  return args.join("/");
}

const PlatformContext = createContext({});

const baseURL = "/";

class PlatformProvider extends Component {
  constructor(props) {
    let editable = true;
    let platform = Platform.WEB;
    editable = false;
    let baseUrl = "/";

    super(props);
    this.state = {
      serializedQueries: !platform === Platform.ELECTRON,
      inEditMode: false,
      platform,
      editable,
      baseUrl,
    };

    this.path = this.path.bind(this);
    this.updateState = this.updateState.bind(this);
    this.computePhotoPath = this.computePhotoPath.bind(this);
    this.resolveSymbol = this.resolveSymbol.bind(this);
    this.resolveLithologySymbol = this.resolveLithologySymbol.bind(this);

    this.storage = new LocalStorage("edit-mode");
    const v = this.storage.get();
    if (v == null) {
      return;
    }
    this.state = update(this.state, { inEditMode: { $set: v } });
  }

  render() {
    let {
      computePhotoPath,
      resolveSymbol,
      resolveLithologySymbol,
      updateState,
    } = this;
    let { serializedQueries, ...restState } = this.state;
    if (this.state.platform === Platform.WEB) {
      serializedQueries = true;
    }
    const { children, ...rest } = this.props;
    const value = {
      ...rest,
      ...restState,
      serializedQueries,
      updateState,
      computePhotoPath,
      resolveSymbol,
      resolveLithologySymbol,
    };

    ({ resolveSymbol } = this.props);
    if (resolveSymbol == null) {
      ({ resolveSymbol } = this);
    }

    const assetPathFunctions = { resolveSymbol, resolveLithologySymbol };
    return h(DarkModeProvider, [
      h(
        GeologicPatternProvider,
        {
          resolvePattern: this.resolveLithologySymbol,
        },
        [
          h(
            AssetPathProvider,
            {
              resolveSymbol: this.resolveSymbol,
            },
            [h(PlatformContext.Provider, { value }, children)],
          ),
        ],
      ),
    ]);
  }

  path(...args) {
    return join(baseURL, ...args);
  }

  updateState(val) {
    return this.setState(val);
  }

  computePhotoPath(photo) {
    if (photo.id == null) {
      return null;
    }
    if (this.state.platform === Platform.ELECTRON) {
      return this.path(
        "..",
        "Products",
        "webroot",
        "Sections",
        "photos",
        `${photo.id}.jpg`,
      );
    } else {
      return this.path("photos", `${photo.id}.jpg`);
    }
    // Original photo
    return photo.path;
  }

  resolveSymbol(sym) {
    if (sym == null) {
      return null;
    }
    let sym1 = sym;
    // Just in case we are passing full names
    if (sym1.endsWith(".svg")) {
      sym1 = sym1.slice(0, -4);
    }
    return columnPatterns[`../assets/column-patterns/${sym1}.svg`];
  }

  resolveLithologySymbol(id, opts = {}) {
    const { svg = true } = opts;
    if (id == null) {
      return null;
    }
    if (svg) {
      return patternSVGs[`../packages/geologic-patterns/assets/svg/${id}.svg`];
    } else {
      return patternPNGs[
        `../packages/geologic-patterns/assets/png-compressed/${id}.png`
      ];
    }
  }

  componentDidUpdate(prevProps, prevState) {
    // Shim global state
    if (prevState.serializedQueries !== this.state.serializedQueries) {
      global.SERIALIZED_QUERIES = this.state.serializedQueries;
    }

    const { inEditMode } = this.state;
    if (prevState.inEditMode !== inEditMode) {
      return this.storage.set({ inEditMode });
    }
  }
}

export { PlatformContext, Platform, PlatformProvider };
