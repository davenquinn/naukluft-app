import { Component, createContext, useContext } from "react";
import h from "react-hyperscript";
import LocalStorage from "./sections/storage";
import update from "immutability-helper";
import {
  AssetPathProvider,
  AssetPathContext,
  GeologicPatternProvider
} from "@macrostrat/column-components";
//# Set whether we are on the backend or frontend

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
  PRINT: 3
});


function join(...args: string[]): string {
  return args.join("/");
}

const DarkModeContext = createContext(false);

const DarkModeProvider = function(props) {
  console.log("Setting up dark mode provider")
  let value = false
  const { children } = props;
  return h(DarkModeContext.Provider, { value }, children);
};

const useDarkMode = () => useContext(DarkModeContext);

const PlatformContext = createContext({});

const baseURL = "/";

console.log("Base url:", baseURL);

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
      baseUrl
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
      updateState
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
      resolveLithologySymbol
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
          resolvePattern: this.resolveLithologySymbol
        },
        [
          h(
            AssetPathProvider,
            {
              resolveSymbol: this.resolveSymbol
            },
            [h(PlatformContext.Provider, { value }, children)]
          )
        ]
      )
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
        `${photo.id}.jpg`
      );
    } else {
      return this.path("photos", `${photo.id}.jpg`);
    }
    // Original photo
    return photo.path;
  }

  resolveSymbol(sym) {
    return join(baseURL, "column-symbols", sym);
  }

  resolveLithologySymbol(id, opts = {}) {
    let { svg } = opts;
    svg = true;
    if (svg == null) {
      svg = false;
    }
    if (id == null) {
      return null;
    }
    if (this.state.platform === Platform.ELECTRON) {
      let fp = `png/${id}.png`;
      if (svg) {
        fp = `svg/${id}.svg`;
      }
      const proj = process.env.PROJECT_DIR || "";
      const q = join(proj, "versioned/deps/geologic-patterns/assets", fp);
      return "file://" + q;
    } else {
      return this.path("lithology-patterns", `${id}.png`);
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

const PlatformConsumer = PlatformContext.Consumer;

export {
  PlatformContext,
  Platform,
  PlatformProvider,
  PlatformConsumer,
  DarkModeContext,
  DarkModeProvider,
  useDarkMode
};
