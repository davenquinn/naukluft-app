import express from "express";
import morgan from "morgan";
import { sync as glob } from "glob";
import { join, resolve } from "path";
import { ResultMask, runBackendQuery } from "./database";

const app = express().disable("x-powered-by");
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

const baseDir = resolve(__dirname, "..", "sql");

const helpRoutes: string[] = [];

interface Params {
  [key: string]: any;
  __qrm?: ResultMask;
}

for (const fn of glob(join(baseDir, "**/*.sql"))) {
  const newFn = fn.replace(baseDir, "").slice(0, -4);
  helpRoutes.push(newFn);
  app.get(newFn, async (req, res) => {
    const { __qrm, ...params }: Params = req.query;
    const queryResult = await runBackendQuery(newFn, params, __qrm);
    res.json(queryResult);
  });
}

app.get("/", (req, res) => {
  res.json({
    v: 1,
    description: "The data service for Naukluft Nappe Complex mapping",
    routes: helpRoutes,
  });
});

const port = 5555;
app.listen(port, () => console.log(`Naukluft API started on port ${port}`));
