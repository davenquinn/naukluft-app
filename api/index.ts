import {createServer } from "naukluft-data-backend"

// We should maybe move this to another file
const port = 5555;
createServer().then(app => {
  app.listen(port, () => console.log(`Naukluft API started on port ${port}`));
});
