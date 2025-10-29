declare global {
  interface NaukluftRuntimeEnv {
    ASSETS_BASE_URL: string;
    MAPBOARD_BASE_URL: string;
  }

  namespace Vike {
    interface PageContext {
      runtimeEnv: NaukluftRuntimeEnv;
    }
  }
}

export {};
