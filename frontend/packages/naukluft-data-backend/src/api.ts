import express from "express";
import morgan from "morgan";
import { sync as glob } from "glob";
import { join, resolve } from "path";
import { ResultMask, runBackendQuery, db } from "./database";
import cors from "cors";
import vectorTileServer from "@macrostrat/vector-tile-server";

const app = express().disable("x-powered-by");
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

app.use(cors());

const baseDir = resolve(__dirname, "..", "sql");

const helpRoutes: string[] = [];

interface Params {
  [key: string]: any;
  __qrm?: ResultMask;
}

for (const fn of glob(join(baseDir, "**/*.sql"))) {
  const newFn = fn.replace(baseDir, "").slice(0, -4);
  helpRoutes.push(newFn);
  app.get(newFn, async (req, res, next) => {
    try {
      let { __qrm, __argsArray, ...params }: Params = req.query;
      let newParams = params;
      if (__argsArray != null) {
        newParams = JSON.parse(__argsArray);
      }
      const queryResult = await runBackendQuery(newFn, newParams, __qrm);
      res.json(queryResult);
    } catch (err) {
      next(err);
    }
  });
}

app.get("/", (req, res) => {
  res.json({
    v: 1,
    description: "The data service for Naukluft Nappe Complex mapping",
    routes: helpRoutes
  });
});

// We should maybe move this to another file
(async function() {
  app.use("/map-data", await vectorTileServer(db, "map-data"));
  helpRoutes.push("/map-data");
})();

const port = 5555;
app.listen(port, () => console.log(`Naukluft API started on port ${port}`));
