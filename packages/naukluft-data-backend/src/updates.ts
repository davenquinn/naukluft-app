import { currentPlatform, Platform } from "./platform";
import axios from "axios";

// Matches `apiBaseURL` in index.ts; kept literal to avoid a circular import.
const apiBaseURL = "/api";

export async function updateSectionInterval(intervalID: number, data: any) {
  /* This is much like the runQuery function but it builds the SQL on the fly */
  console.log(data);
  const key = "section/update-interval";
  switch (currentPlatform) {
    case Platform.WEB:
      const res = await axios.post(apiBaseURL + "/" + key, data, {
        params: { intervalID },
      });
      if (res.status == 200) {
        let { data } = res;
        return data;
      } else {
        throw `Invalid response for key: ${key}`;
      }
    default:
      // Assemble and run the query (server-only; lazily required so the
      // schema config / dotenv never reaches the client bundle).
      const { helpers, db } = require("./database");
      const { schemaMap } = require("./project-schema");

      const { TableName, update } = helpers;
      const tbl = new TableName({
        table: "section_lithology",
        schema: schemaMap.section,
      });
      let sql = update(data, null, tbl) + " WHERE id=${id}";
      console.log(sql);
      return await db.none(sql, { id: intervalID });
  }
}
