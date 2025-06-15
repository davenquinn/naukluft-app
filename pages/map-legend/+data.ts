import { runQuery } from "naukluft-data-backend";

export async function data() {
  return await runQuery("map-data/unit-data");
}
