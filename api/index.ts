// Check that NAUKLUFT_DB environment variable is set, otherwise throw an error
if (!process.env.NAUKLUFT_DB) {
  throw new Error("NAUKLUFT_DB environment variable not set");
}

import { createServer } from "naukluft-data-backend/src/api";
// We should maybe move this to another file
const port = 5555;
createServer().then((app) => {
  app.listen(port, () => console.log(`Naukluft API started on port ${port}`));
});
