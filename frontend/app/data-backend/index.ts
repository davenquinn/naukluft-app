import { join } from "path";
import { db, storedProcedure } from "./database";
import { useState } from "react";
import useAsyncEffect from "use-async-effect";
import { queryResult } from "pg-promise";

export const runQuery = async function (
  key: string,
  params: any = null,
  resultMask: queryResult = queryResult.any
): Promise<any> {
  /*
  Generalized query that picks the best method for
  getting query variables
  */
  const fn = join(__dirname, "sql", key + ".sql");
  console.log("Running query fn");
  return await db.query(storedProcedure(fn), params, resultMask);
};

export function useUpdateableQuery(
  key: string,
  params: any = null,
  resultMask: queryResult = queryResult.any
) {
  /** A react hook to use the result of a query */
  const [result, updateResult] = useState<any>(null);
  const queryFunc = async function () {
    const res = await runQuery(key, params, result);
    return updateResult(res);
  };
  useAsyncEffect(queryFunc, [params]);
  return [result, updateResult];
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

export async function useQueryDispatch(
  key: string,
  resultMask: queryResult = queryResult.any
) {
  return (params: any) => runQuery(key, params, resultMask);
}

export { queryResult as ResultMask };
