import { currentPlatform, Platform } from "./platform";
import axios from "axios";

export async function updateSectionInterval(intervalID: number, data: any) {
  /* This is much like the runQuery function but it builds the SQL on the fly */
  console.log(data);
  const key = "section/update-interval";
  switch (currentPlatform) {
    case Platform.WEB:
      const res = await axios.post("http://localhost:5555/" + key, data, {
        params: { intervalID },
      });
      if (res.status == 200) {
        let { data } = res;
        return data;
      } else {
        throw `Invalid response for key: ${key}`;
      }
    default:
      // Assemble and run the query
      const { helpers, db } = require("./database");

      const { TableName, update } = helpers;
      const tbl = new TableName({
        table: "section_lithology",
        schema: "section",
      });
      let sql = update(data, null, tbl) + " WHERE id=${id}";
      console.log(sql);
      return await db.none(sql, { id: intervalID });
  }
}
