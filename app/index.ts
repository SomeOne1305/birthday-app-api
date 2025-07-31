import { connectToDB } from "../database/connection";
import logger from "../logger";
import { app } from "./app";
import "dotenv/config";

const PORT = process.env.PORT || 3000;

if(process.env.DEPLOYMENT_ENV !== 'vercel'){
  app.listen(PORT).on("listening", async () => {
    await connectToDB();
    logger.info(`Server is listening on port http://localhost:${PORT}`);
  });
}

let isConnected = false;

// Export the Express app as a handler function
// Vercel will now use this 'app' object to process requests
// It is recommended to use "export default app;" in modern TS/ESM.
// For CommonJS, `module.exports = app;` is correct.
if (!isConnected) {
    connectToDB().then(() => {
        logger.info("MongoDB connected");
        isConnected = true;
    }).catch(err => {
        logger.error("MongoDB connection failed:", err);
    });
}

module.exports = app
