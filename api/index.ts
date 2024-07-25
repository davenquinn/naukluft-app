process.env.NAUKLUFT_DB =
  "postgresql://mapboard_admin:a1d491c9-1fe5-426d-bdd3-2365ea17deee@localhost:54398/naukluft";

import { createServer } from "naukluft-data-backend/src/api";
// We should maybe move this to another file
const port = 5555;
createServer().then((app) => {
  app.listen(port, () => console.log(`Naukluft API started on port ${port}`));
});
