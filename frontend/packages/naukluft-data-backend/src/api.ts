import express from "express";
import morgan from "morgan";
import { sync as glob } from "glob";
import { join, resolve } from "path";
import { ResultMask, runBackendQuery, db } from "./database";
import { updateSectionInterval } from "./updates";
import cors from "cors";
import vectorTileServer from "@macrostrat/vector-tile-server";

const baseDir = resolve(__dirname, "..", "sql");

interface Params {
  [key: string]: any;
}
interface ExtParams extends Params {
  __qrm?: ResultMask;
}

type APIHandler = (params: Params) => Promise<any>;

function apiRoute(handler: APIHandler) {
  return async (req: any, res: any, next: any) => {
    try {
      const queryResult = await handler(req.query);
      res.json(queryResult);
    } catch (err) {
      next(err);
    }
  };
}

function buildQueryFileRoutes(app: any) {
  let helpRoutes: string[] = [];
  for (const fn of glob(join(baseDir, "**/*.sql"))) {
    const newFn = fn.replace(baseDir, "").slice(0, -4);
    helpRoutes.push(newFn);

    const handler = async (params: Params) => {
      let { __qrm, __argsArray, ...rest }: ExtParams = params;
      let newParams = rest;
      if (__argsArray != null) {
        newParams = JSON.parse(__argsArray);
      }
      return await runBackendQuery(newFn, newParams, __qrm);
    };

    app.get(newFn, apiRoute(handler));
  }
  return helpRoutes;
}

function addSectionUpdateRoute(app: any) {
  const routeName = "/section/update-interval";
  const updateHandler = async (params: Params) => {
    const { intervalID, ...rest } = params;
    return updateSectionInterval(intervalID, rest);
  };
  app.get(routeName, apiRoute(updateHandler));
  return routeName;
}

async function addTileServer(app: any) {
  const routeName = "/map-data/map-tiles";
  // create vector tiles server
  app.use(routeName, await vectorTileServer(db, "map-data"));
  return routeName;
}

async function createServer() {
  const app = express().disable("x-powered-by");
  if (process.env.NODE_ENV !== "production") {
    app.use(morgan("dev"));
  }
  app.use(cors());
  let helpRoutes = buildQueryFileRoutes(app);
  helpRoutes.push(addSectionUpdateRoute(app));
  helpRoutes.push(await addTileServer(app));
  // create help route
  app.get("/", (req, res) => {
    helpRoutes.sort();
    res.json({
      v: 1,
      description: "The data service for Naukluft Nappe Complex mapping",
      routes: helpRoutes
    });
  });

  return app;
}

// We should maybe move this to another file
const port = 5555;
createServer().then(app => {
  app.listen(port, () => console.log(`Naukluft API started on port ${port}`));
});
