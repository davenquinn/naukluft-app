import express from "express";
import morgan from "morgan";

const app = express().disable("x-powered-by");
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

const port = 5555;
app.listen(port, () => console.log(`Naukluft API started on port ${port}`));
