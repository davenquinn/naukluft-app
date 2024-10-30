/// <reference lib="webworker" />
import { renderPage } from "vike/server";
import type { Get, UniversalHandler } from "@universal-middleware/core";

export const vikeHandler: Get<[], UniversalHandler> =
  () => async (request, context, runtime) => {
    const pageContextInit = {
      ...context,
      ...runtime,
      runtimeEnv: buildConfigFromEnvironment(),
      urlOriginal: request.url,
      headersOriginal: request.headers,
    };
    const pageContext = await renderPage(pageContextInit);
    const response = pageContext.httpResponse;

    const { readable, writable } = new TransformStream();
    response.pipe(writable);

    return new Response(readable, {
      status: response.statusCode,
      headers: response.headers,
    });
  };

function buildConfigFromEnvironment() {
  /** Creates a mapping of environment variables that start with VITE_,
   * and returns them as an object. This allows us to pass environment
   * variables to the client.
   *
   * TODO: Ideally this would be defined in library code.
   * */
  const env: Record<string, string> = {};
  for (const [key, value] of Object.entries(process.env)) {
    if (key.startsWith("VITE_") && value != null) {
      let newKey = key.substring(5);
      env[newKey] = value;
    }
  }
  return env;
}
