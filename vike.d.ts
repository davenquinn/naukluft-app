declare global {
  namespace Vike {
    interface PageContext {
      runtimeEnv: Record<string, string>;
    }
  }
}

export {};
