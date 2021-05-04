import { useState } from "react";
import useAsyncEffect from "use-async-effect";
import { currentPlatform, Platform } from "./platform";
import get from "axios";

// Copied from pg-promise
enum queryResult {
  /** Single row is expected, to be resolved as a single row-object. */
  one = 1,
  /** One or more rows expected, to be resolved as an array, with at least 1 row-object. */
  many = 2,
  /** Expecting no rows, to be resolved with `null`. */
  none = 4,
  /** `many|none` - any result is expected, to be resolved with an array of rows-objects. */
  any = 6,
}

export const runQuery = async function (
  key: string,
  params: any = null,
  resultMask: queryResult = queryResult.any
): Promise<any> {
  /*
  Generalized query that picks the best method for
  getting query variables
  */
  console.log("Running query with key:", key);

  switch (currentPlatform) {
    case Platform.WEB:
      if (key.endsWith(".sql")) {
        throw "Can't run SQL file on frontend!";
      }
      const res = await get("http://localhost:5555/" + key, {
        ...params,
        __qrm: resultMask,
      });
      if (res.status == 200) {
        let { data } = res;
        return data;
      } else {
        throw `Invalid response for key: ${key}`;
      }
    default:
      const { runBackendQuery } = require("./database");
      return await runBackendQuery(key, params, resultMask);
  }
};

export function useUpdateableQuery(
  key: string,
  params: any = null,
  resultMask: queryResult = queryResult.any
) {
  /** A react hook to use the result of a query */
  const [result, updateResult] = useState<any>(null);
  const queryFunc = async function () {
    const res = await runQuery(key, params, resultMask);
    return updateResult(res);
  };
  useAsyncEffect(queryFunc, [params]);
  return [result, queryFunc];
}

export function useQuery(
  key: string,
  params: any = null,
  resultMask: queryResult = queryResult.any
) {
  /** A react hook to use the result of a query */
  const [res, _] = useUpdateableQuery(key, params, resultMask);
  return res;
}

export function useQueryRunner(): typeof runQuery {
  // @ts-ignore
  return runQuery;
}

export { queryResult as ResultMask };
