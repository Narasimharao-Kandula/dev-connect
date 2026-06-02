import { createServer } from "http";
import app from "./app";
import { setupSocket } from "./socket";
import { env } from "./config/env";

const httpServer = createServer(app);
setupSocket(httpServer);

httpServer.listen(env.PORT, () => {
  console.log(`DevConnect server running on port ${env.PORT}`);
});
