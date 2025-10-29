import { Component, createContext, useContext, useEffect } from "react";
import hyper from "@macrostrat/hyper";
import { DarkModeProvider, LocalStorage } from "@macrostrat/ui-components";

import update from "immutability-helper";
import { GeologicPatternProvider } from "@macrostrat/column-components";
import styles from "./platform.module.sass";

const h = hyper.styled(styles);

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

export enum TargetEnvironment {
  Print = "print",
  Interactive = "interactive",
}

const PlatformContext = createContext({
  environment: TargetEnvironment.Interactive,
  platform: Platform.WEB,
  editable: false,
});

export function useTargetEnvironment() {
  return useContext(PlatformContext).environment;
}

const baseURL = "/";

class PlatformProvider extends Component<{
  children: React.ReactNode;
  environment?: TargetEnvironment;
}> {
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

    this.storage = new LocalStorage("edit-mode");
    const v = this.storage.get();
    if (v == null) {
      return;
    }
    this.state = update(this.state, { inEditMode: { $set: v } });
  }

  render() {
    let { computePhotoPath, updateState } = this;
    let { serializedQueries, ...restState } = this.state;
    if (this.state.platform === Platform.WEB) {
      serializedQueries = true;
    }
    const { children, ...rest } = this.props;

    const environment = this.props.environment ?? TargetEnvironment.Interactive;
    const value = {
      ...rest,
      ...restState,
      serializedQueries,
      updateState,
      computePhotoPath,
      environment,
    };

    return h(DarkModeProvider, [
      h(
        GeologicPatternProvider,
        {
          resolvePattern(patternID) {
            return `https://dev.macrostrat.org/assets/geologic-patterns/svg/${patternID}.svg`;
          },
        },
        h(
          PlatformContext.Provider,
          { value },
          h("div.environment-manager", { className: "env-" + environment }, [
            children,
            h(EnvironmentBodyClassManager, { environment }),
          ]),
        ),
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

function EnvironmentBodyClassManager({ environment }) {
  useEffect(() => {
    const cls = `env-${environment}`;
    document.body.classList.add(cls);
    return () => {
      document.body.classList.remove(cls);
    };
  }, [environment]);
  return null;
}

export { PlatformContext, Platform, PlatformProvider };
