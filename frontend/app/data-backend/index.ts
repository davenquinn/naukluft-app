import { join } from "path";
import { db, storedProcedure } from "./database";
import { useState } from "react";
import useAsyncEffect from "use-async-effect";

const runQuery = async function (key: string, params: any): Promise<any> {
  /*
  Generalized query that picks the best method for
  getting query variables
  */
  const fn = join(__dirname, "sql", key + ".sql");
  console.log("Running query fn");
  return await db.query(storedProcedure(fn), params);
};

export function useQuery(key: string, params: any = null) {
  /** A react hook to use the result of a query */
  const [result, updateResult] = useState<any>(null);
  const queryFunc = async function () {
    const res = await runQuery(key, params);
    return updateResult(res);
  };
  useAsyncEffect(queryFunc, [params]);
  return result;
}
