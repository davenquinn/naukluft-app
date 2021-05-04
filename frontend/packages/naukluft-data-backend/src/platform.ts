import isElectron from "is-electron";

export enum Platform {
  ELECTRON,
  WEB,
  NODE,
}

export function getCurrentPlatform(): Platform {
  if (isElectron()) {
    return Platform.ELECTRON;
  } else if (typeof window === "undefined") {
    return Platform.NODE;
  } else {
    return Platform.WEB;
  }
}

export const currentPlatform = getCurrentPlatform();
